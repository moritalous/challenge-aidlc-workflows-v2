import { spawn } from 'node:child_process';
import type { GateResult, Pillar } from '@vibe/contracts';
import type {
  GateContext,
  PillarRunner,
  PillarRunners,
} from './gate/quality-gate.js';
import { Deployer, type DeployerDeps } from './deploy/deployer.js';
import type { Project } from '@vibe/contracts';

/**
 * Production pillar runners. Each shells out to the real tool and normalizes the
 * exit code into a {@link GateResult}. These are the default wiring; tests inject
 * mocks instead so the gate logic is verifiable offline.
 *
 * NOTE: no secrets are read or embedded here. Scanners that need credentials read
 * them from the ambient environment / standard credential chain.
 */

/** Runs a shell command and resolves with its exit code + captured output. */
function run(
  command: string,
  args: readonly string[],
  cwd: string,
): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false });
    let out = '';
    child.stdout.on('data', (d: Buffer) => (out += d.toString()));
    child.stderr.on('data', (d: Buffer) => (out += d.toString()));
    child.on('error', (err) => resolve({ code: 1, out: String(err) }));
    child.on('close', (code) => resolve({ code: code ?? 1, out }));
  });
}

/** Builds a PASS/FAIL result from a command's exit code. */
function fromExit(
  pillar: Pillar,
  code: number,
  out: string,
  passMsg: string,
): GateResult {
  if (code === 0) {
    return { pillar, status: 'PASS', details: passMsg };
  }
  return {
    pillar,
    status: 'FAIL',
    details: `${pillar} failed (exit ${code}): ${out.slice(-2000)}`,
  };
}

/** test pillar: run the project's test suite. */
export const testRunner: PillarRunner = async (ctx: GateContext) => {
  const { code, out } = await run('npm', ['test'], ctx.projectDir);
  return fromExit('test', code, out, 'tests passed');
};

/** static pillar: type-check + lint. Either failing fails the pillar. */
export const staticRunner: PillarRunner = async (ctx: GateContext) => {
  const tsc = await run('npm', ['run', 'typecheck'], ctx.projectDir);
  if (tsc.code !== 0) {
    return fromExit('static', tsc.code, tsc.out, '');
  }
  const lint = await run('npm', ['run', 'lint'], ctx.projectDir);
  return fromExit('static', lint.code, lint.out, 'typecheck + lint clean');
};

/**
 * security pillar: AND of npm audit, trivy, gitleaks, semgrep (security-design).
 * Any tool reporting High/Critical fails the pillar. A tool that cannot run is an
 * ERROR (non-PASS), not a silent pass.
 */
export const securityRunner: PillarRunner = async (ctx: GateContext) => {
  const checks: Array<[string, string[]]> = [
    ['npm', ['audit', '--audit-level=high']],
    ['trivy', ['fs', '--severity', 'HIGH,CRITICAL', '--exit-code', '1', '.']],
    ['gitleaks', ['detect', '--no-banner']],
    ['semgrep', ['--error', '--severity', 'ERROR', '.']],
  ];
  const failures: string[] = [];
  for (const [cmd, args] of checks) {
    const { code, out } = await run(cmd, args, ctx.projectDir);
    if (code !== 0) {
      failures.push(`${cmd}: exit ${code} ${out.slice(-400)}`);
    }
  }
  if (failures.length > 0) {
    return {
      pillar: 'security',
      status: 'FAIL',
      details: `security findings: ${failures.join(' | ')}`,
    };
  }
  return {
    pillar: 'security',
    status: 'PASS',
    details: 'no high/critical findings',
  };
};

/** deploy pillar: delegates to the {@link Deployer} (cdk + smoke). */
export function makeDeployRunner(
  deployerDeps: DeployerDeps,
  project: Project,
): PillarRunner {
  const deployer = new Deployer(deployerDeps);
  return async () => deployer.deploy(project);
}

/** Assembles the default production runner set. */
export function defaultRunners(deployRunner: PillarRunner): PillarRunners {
  return {
    test: testRunner,
    static: staticRunner,
    security: securityRunner,
    deploy: deployRunner,
  };
}
