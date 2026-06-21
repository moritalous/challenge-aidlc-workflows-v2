import type { GateResult, GateVerdict } from '@vibe/contracts';

/**
 * Fail-closed quality-gate evaluation (BR-T1 / business-logic-model.md).
 *
 * Invariant (do not weaken):
 *   passed = results.length === 4 && results.every(r => r.status === "PASS")
 *   next   = passed ? "Deploying" : "HaltForHuman"
 *
 * - PENDING and ERROR are non-PASS (US-D2 AC2/AC3) — they fail `every(PASS)`.
 * - Partial pass (some of 4 PASS) is a fail (US-B2 AC3).
 * - Order-independent: the verdict does not depend on result ordering.
 * - The skeleton has NO auto-fix (U6 is out of scope). A non-PASS verdict routes
 *   to `HaltForHuman`, which stops once and surfaces the failing pillars (BR-T1').
 *
 * @param results The per-pillar results. Expected length is exactly 4.
 * @returns The pass/fail verdict and the next state.
 */
export function evaluate(results: readonly GateResult[]): GateVerdict {
  const passed =
    results.length === 4 && results.every((r) => r.status === 'PASS');
  return { passed, next: passed ? 'Deploying' : 'HaltForHuman' };
}

/**
 * Returns the subset of results that are non-PASS (FAIL/PENDING/ERROR), used to
 * build the HaltForHuman message that lists failing pillars + reasons (BR-T1').
 */
export function failingPillars(
  results: readonly GateResult[],
): readonly GateResult[] {
  return results.filter((r) => r.status !== 'PASS');
}
