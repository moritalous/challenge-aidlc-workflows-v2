import { describe, it, expect } from 'vitest';
import type { GateResult, Pillar } from '@vibe/contracts';
import { CliOrchestrator, type OrchestratorDeps } from './orchestrator.js';
import { TemplateProvider } from './gen/template-provider.js';
import type { PillarRunners } from './gate/quality-gate.js';

function pass(pillar: Pillar): GateResult {
  return { pillar, status: 'PASS', details: 'ok' };
}

const allPassRunners: PillarRunners = {
  test: () => pass('test'),
  static: () => pass('static'),
  security: () => pass('security'),
  deploy: () => pass('deploy'),
};

function deps(runners: PillarRunners): OrchestratorDeps {
  return {
    provider: new TemplateProvider(),
    runners,
    gateContext: { timeoutMs: 100 },
  };
}

describe('CliOrchestrator', () => {
  it('happy path: all PASS -> Deploying -> Done', async () => {
    const o = new CliOrchestrator(deps(allPassRunners));
    const outcome = await o.run(
      'a task crud app with create update delete',
      'p1',
    );
    expect(outcome.finalState).toBe('Done');
    expect(outcome.gateResults).toHaveLength(4);
    expect(outcome.project?.id).toBe('p1');
    const states = outcome.transitions.map((t) => t.to);
    expect(states).toContain('Deploying');
    expect(states).toContain('Done');
  });

  it('non-PASS gate -> HaltForHuman, NO auto-fix / NO retry', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      security: () => ({
        pillar: 'security',
        status: 'FAIL',
        details: 'gitleaks found 1 secret',
      }),
    };
    const o = new CliOrchestrator(deps(runners));
    const outcome = await o.run('task crud app', 'p2');

    expect(outcome.finalState).toBe('HaltForHuman');
    // Assert NO auto-fix: there must be exactly one Gating transition and no
    // Deploying/Done. The skeleton stops once (BR-T1').
    const gatingCount = outcome.transitions.filter(
      (t) => t.to === 'Gating',
    ).length;
    expect(gatingCount).toBe(1);
    expect(outcome.transitions.map((t) => t.to)).not.toContain('Deploying');
    expect(outcome.transitions.map((t) => t.to)).not.toContain('Done');
    expect(outcome.halt?.failing.map((r) => r.pillar)).toContain('security');
    expect(outcome.halt?.message).toContain('no auto-fix');
  });

  it('PENDING pillar also routes to HaltForHuman', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      test: () => ({ pillar: 'test', status: 'PENDING', details: 'not run' }),
    };
    const o = new CliOrchestrator(deps(runners));
    const outcome = await o.run('task crud app', 'p3');
    expect(outcome.finalState).toBe('HaltForHuman');
  });

  it('missing intent -> routes back to Reviewing (no generation)', async () => {
    const o = new CliOrchestrator(deps(allPassRunners));
    const outcome = await o.run('   ', 'p4');
    expect(outcome.finalState).toBe('Reviewing');
    expect(outcome.missingIntent).toContain('entities');
    expect(outcome.project).toBeUndefined();
  });

  it('reviewer rejection halts before generation', async () => {
    const o = new CliOrchestrator({
      ...deps(allPassRunners),
      reviewer: () => false,
    });
    const outcome = await o.run('task crud app', 'p5');
    expect(outcome.finalState).toBe('Reviewing');
    expect(outcome.transitions.map((t) => t.to)).not.toContain('Generating');
  });

  it('a pillar that errors (ERROR) routes to HaltForHuman', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      static: () => {
        throw new Error('tsc crashed');
      },
    };
    const o = new CliOrchestrator(deps(runners));
    const outcome = await o.run('task crud app', 'p6');
    expect(outcome.finalState).toBe('HaltForHuman');
    expect(
      outcome.halt?.failing.find((r) => r.pillar === 'static')?.status,
    ).toBe('ERROR');
  });
});
