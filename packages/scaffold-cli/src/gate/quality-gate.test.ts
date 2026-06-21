import { describe, it, expect } from 'vitest';
import type { GateResult } from '@vibe/contracts';
import { runGate, type PillarRunners } from './quality-gate.js';

const ctx = { projectDir: '/tmp/project', timeoutMs: 50 };

function pass(pillar: GateResult['pillar']): GateResult {
  return { pillar, status: 'PASS', details: 'ok' };
}

const allPassRunners: PillarRunners = {
  test: () => pass('test'),
  static: () => pass('static'),
  security: () => pass('security'),
  deploy: () => pass('deploy'),
};

describe('runGate', () => {
  it('returns exactly 4 results', async () => {
    const { results } = await runGate(allPassRunners, ctx);
    expect(results).toHaveLength(4);
    expect(results.map((r) => r.pillar).sort()).toEqual([
      'deploy',
      'security',
      'static',
      'test',
    ]);
  });

  it('all PASS -> verdict passed=true, next=Deploying', async () => {
    const { verdict } = await runGate(allPassRunners, ctx);
    expect(verdict.passed).toBe(true);
    expect(verdict.next).toBe('Deploying');
  });

  it('mixed (one FAIL) -> passed=false, next=HaltForHuman', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      security: () => ({
        pillar: 'security',
        status: 'FAIL',
        details: 'gitleaks: 1 secret',
      }),
    };
    const { verdict, results } = await runGate(runners, ctx);
    expect(verdict.passed).toBe(false);
    expect(verdict.next).toBe('HaltForHuman');
    expect(results).toHaveLength(4);
  });

  it('a runner that throws is normalized to ERROR (non-PASS)', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      static: () => {
        throw new Error('tsc crashed');
      },
    };
    const { results, verdict } = await runGate(runners, ctx);
    const staticResult = results.find((r) => r.pillar === 'static');
    expect(staticResult?.status).toBe('ERROR');
    expect(staticResult?.details).toContain('tsc crashed');
    expect(verdict.passed).toBe(false);
    expect(verdict.next).toBe('HaltForHuman');
  });

  it('a runner that times out is normalized to ERROR -> HaltForHuman', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      deploy: () =>
        new Promise<GateResult>((resolve) =>
          setTimeout(() => resolve(pass('deploy')), 10_000),
        ),
    };
    const { results, verdict } = await runGate(runners, {
      projectDir: '/tmp/project',
      timeoutMs: 20,
    });
    const deployResult = results.find((r) => r.pillar === 'deploy');
    expect(deployResult?.status).toBe('ERROR');
    expect(deployResult?.details).toContain('timed out');
    expect(verdict.passed).toBe(false);
    expect(verdict.next).toBe('HaltForHuman');
  });

  it('a rejected promise is normalized to ERROR', async () => {
    const runners: PillarRunners = {
      ...allPassRunners,
      test: () => Promise.reject(new Error('vitest exploded')),
    };
    const { results } = await runGate(runners, ctx);
    const testResult = results.find((r) => r.pillar === 'test');
    expect(testResult?.status).toBe('ERROR');
    expect(testResult?.details).toContain('vitest exploded');
  });

  it('uses default timeout when none provided', async () => {
    const { results } = await runGate(allPassRunners, {
      projectDir: '/tmp/project',
    });
    expect(results).toHaveLength(4);
  });
});
