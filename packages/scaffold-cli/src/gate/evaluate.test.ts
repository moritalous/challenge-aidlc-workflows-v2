import { describe, it, expect } from 'vitest';
import type { GateResult, Pillar, GateStatus } from '@vibe/contracts';
import { evaluate, failingPillars } from './evaluate.js';

function result(pillar: Pillar, status: GateStatus): GateResult {
  return { pillar, status, details: `${pillar}:${status}` };
}

const allPass: GateResult[] = [
  result('test', 'PASS'),
  result('static', 'PASS'),
  result('security', 'PASS'),
  result('deploy', 'PASS'),
];

describe('evaluate (fail-closed BR-T1)', () => {
  it('all 4 PASS -> passed=true, next=Deploying', () => {
    const verdict = evaluate(allPass);
    expect(verdict.passed).toBe(true);
    expect(verdict.next).toBe('Deploying');
  });

  it('one FAIL -> passed=false, next=HaltForHuman', () => {
    const results = [
      result('test', 'PASS'),
      result('static', 'FAIL'),
      result('security', 'PASS'),
      result('deploy', 'PASS'),
    ];
    const verdict = evaluate(results);
    expect(verdict.passed).toBe(false);
    expect(verdict.next).toBe('HaltForHuman');
  });

  it('PENDING is non-PASS -> HaltForHuman (US-D2 AC2)', () => {
    const results = [
      result('test', 'PASS'),
      result('static', 'PASS'),
      result('security', 'PENDING'),
      result('deploy', 'PASS'),
    ];
    expect(evaluate(results).passed).toBe(false);
    expect(evaluate(results).next).toBe('HaltForHuman');
  });

  it('ERROR is non-PASS -> HaltForHuman (US-D2 AC3)', () => {
    const results = [
      result('test', 'PASS'),
      result('static', 'PASS'),
      result('security', 'PASS'),
      result('deploy', 'ERROR'),
    ];
    expect(evaluate(results).passed).toBe(false);
    expect(evaluate(results).next).toBe('HaltForHuman');
  });

  it('only 3 pillars -> fail even if all PASS (US-B2 AC3 partial=fail)', () => {
    const results = [
      result('test', 'PASS'),
      result('static', 'PASS'),
      result('security', 'PASS'),
    ];
    const verdict = evaluate(results);
    expect(verdict.passed).toBe(false);
    expect(verdict.next).toBe('HaltForHuman');
  });

  it('more than 4 results (5) -> fail (length !== 4)', () => {
    const results = [...allPass, result('test', 'PASS')];
    expect(evaluate(results).passed).toBe(false);
  });

  it('empty results -> fail', () => {
    expect(evaluate([]).passed).toBe(false);
    expect(evaluate([]).next).toBe('HaltForHuman');
  });

  it('order-independent: shuffled all-PASS still passes', () => {
    const shuffled = [
      result('deploy', 'PASS'),
      result('security', 'PASS'),
      result('test', 'PASS'),
      result('static', 'PASS'),
    ];
    expect(evaluate(shuffled).passed).toBe(true);
    expect(evaluate(shuffled).next).toBe('Deploying');
  });

  it('order-independent: shuffled with one FAIL still fails', () => {
    const shuffled = [
      result('deploy', 'PASS'),
      result('security', 'FAIL'),
      result('static', 'PASS'),
      result('test', 'PASS'),
    ];
    expect(evaluate(shuffled).passed).toBe(false);
  });
});

describe('failingPillars', () => {
  it('returns empty when all PASS', () => {
    expect(failingPillars(allPass)).toHaveLength(0);
  });

  it('lists FAIL, PENDING and ERROR pillars', () => {
    const results = [
      result('test', 'PASS'),
      result('static', 'FAIL'),
      result('security', 'PENDING'),
      result('deploy', 'ERROR'),
    ];
    const failing = failingPillars(results);
    expect(failing.map((r) => r.pillar).sort()).toEqual([
      'deploy',
      'security',
      'static',
    ]);
  });
});
