import type { GateResult, Project } from '@vibe/contracts';

/** A discriminated Result type so callers never face silent failures. */
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

/** Outcome of a `cdk deploy` invocation. */
export interface CdkResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

/** Injectable `cdk deploy` runner. Real impl spawns child_process; tests mock it. */
export type CdkRunner = (project: Project) => Promise<CdkResult>;

/** Injectable smoke-check. Real impl does GET /health; tests mock it. */
export type SmokeCheck = (project: Project) => Promise<{
  readonly status: number;
  readonly elapsedMs: number;
}>;

/** Dependencies injected into {@link Deployer} so tests never shell out. */
export interface DeployerDeps {
  readonly cdk: CdkRunner;
  readonly smoke: SmokeCheck;
  /** Smoke-check budget in ms (FR-4.2: GET /health == 200 within 5s). */
  readonly smokeBudgetMs?: number;
}

const ROLLBACK_STEPS = [
  'CloudFormation auto-rolls the stack back to the last stable state.',
  'For manual recovery run: cdk deploy --rollback',
  'Or redeploy the previous revision (diff/update, not full recreate).',
].join(' ');

/**
 * Deployer (U5) — deploys a {@link Project} to AWS idempotently (BR-T6: diff/
 * update, not full recreate) and runs a post-deploy smoke check (GET /health ==
 * 200 within the budget). On any failure it returns a non-PASS `deploy`
 * GateResult whose `details` carries the rollback steps (FR-4.4).
 *
 * The cdk + smoke calls are injected (constructor) so unit tests never touch AWS
 * or the network (construction-phase: external calls must be mockable).
 */
export class Deployer {
  private readonly smokeBudgetMs: number;

  constructor(private readonly deps: DeployerDeps) {
    this.smokeBudgetMs = deps.smokeBudgetMs ?? 5_000;
  }

  /**
   * Deploys and smoke-checks the project.
   * @returns A `deploy` {@link GateResult}: PASS on 200-in-budget, else FAIL/ERROR.
   */
  async deploy(project: Project): Promise<GateResult> {
    const cdkResult = await this.runCdk(project);
    if (!cdkResult.ok) {
      return this.deployFail(`cdk deploy failed: ${cdkResult.error}`);
    }

    const smokeResult = await this.runSmoke(project);
    if (!smokeResult.ok) {
      return this.deployFail(`smoke check failed: ${smokeResult.error}`);
    }

    const { status, elapsedMs } = smokeResult.value;
    if (status !== 200) {
      return this.deployFail(
        `GET /health returned ${status} (expected 200) in ${elapsedMs}ms`,
      );
    }
    if (elapsedMs > this.smokeBudgetMs) {
      return this.deployFail(
        `GET /health took ${elapsedMs}ms (> ${this.smokeBudgetMs}ms budget)`,
      );
    }

    return {
      pillar: 'deploy',
      status: 'PASS',
      details: `deployed; GET /health 200 in ${elapsedMs}ms`,
    };
  }

  private async runCdk(project: Project): Promise<Result<CdkResult>> {
    try {
      const res = await this.deps.cdk(project);
      if (res.exitCode !== 0) {
        return { ok: false, error: res.stderr || `exit ${res.exitCode}` };
      }
      return { ok: true, value: res };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async runSmoke(
    project: Project,
  ): Promise<Result<{ status: number; elapsedMs: number }>> {
    try {
      return { ok: true, value: await this.deps.smoke(project) };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /** Builds a FAIL deploy result whose details include the rollback runbook. */
  private deployFail(reason: string): GateResult {
    return {
      pillar: 'deploy',
      status: 'FAIL',
      details: `${reason}. Rollback: ${ROLLBACK_STEPS}`,
    };
  }
}
