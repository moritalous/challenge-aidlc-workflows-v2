import type { GateResult, GateVerdict, Pillar } from '@vibe/contracts';
import { evaluate } from './evaluate.js';

/**
 * A pillar runner produces the {@link GateResult} for one pillar. Implementations
 * shell out to the real scanners (vitest, tsc/eslint, npm audit/trivy/gitleaks/
 * semgrep, cdk smoke) in production and are mocked in tests so the gate logic is
 * verifiable without network/AWS access.
 */
export type PillarRunner = (
  ctx: GateContext,
) => Promise<GateResult> | GateResult;

/** Context passed to each pillar runner. */
export interface GateContext {
  /** Absolute path to the generated project under evaluation. */
  readonly projectDir: string;
  /** Per-pillar timeout in milliseconds. A timeout normalizes to ERROR. */
  readonly timeoutMs: number;
}

/** The four runners, one per pillar. */
export type PillarRunners = Readonly<Record<Pillar, PillarRunner>>;

/** Combined output of {@link runGate}. */
export interface GateRun {
  readonly results: readonly GateResult[];
  readonly verdict: GateVerdict;
}

const DEFAULT_TIMEOUT_MS = 120_000;

/**
 * Wraps a promise with a timeout. On timeout the returned promise rejects with a
 * tagged error so the caller can normalize it to an ERROR GateResult.
 */
function withTimeout<T>(
  task: Promise<T>,
  timeoutMs: number,
  pillar: Pillar,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`pillar "${pillar}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    task.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}

/** Normalizes any thrown/timed-out runner into a non-PASS ERROR result. */
function toErrorResult(pillar: Pillar, err: unknown): GateResult {
  const message = err instanceof Error ? err.message : String(err);
  return {
    pillar,
    status: 'ERROR',
    details: `pillar runner failed: ${message}`,
  };
}

/**
 * Runs all four pillars in parallel (Promise.allSettled) with a per-pillar
 * timeout, normalizes any rejection/timeout to an ERROR GateResult (non-PASS),
 * then applies the fail-closed {@link evaluate}.
 *
 * Invariant: always returns exactly 4 results (one per pillar), so a crashed or
 * timed-out pillar cannot silently shrink the result set and accidentally pass.
 *
 * @param runners The four pillar runners.
 * @param ctx Gate context (project dir, timeout).
 * @returns The 4 results plus the fail-closed verdict.
 */
export async function runGate(
  runners: PillarRunners,
  ctx: Partial<GateContext> & { projectDir: string },
): Promise<GateRun> {
  const fullCtx: GateContext = {
    projectDir: ctx.projectDir,
    timeoutMs: ctx.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };

  const pillars = Object.keys(runners) as Pillar[];

  const settled = await Promise.allSettled(
    pillars.map((pillar) =>
      withTimeout(
        Promise.resolve().then(() => runners[pillar](fullCtx)),
        fullCtx.timeoutMs,
        pillar,
      ),
    ),
  );

  const results: GateResult[] = settled.map((outcome, i) => {
    const pillar = pillars[i] as Pillar;
    if (outcome.status === 'fulfilled') {
      return outcome.value;
    }
    return toErrorResult(pillar, outcome.reason);
  });

  return { results, verdict: evaluate(results) };
}
