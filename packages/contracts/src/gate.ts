/**
 * U0 contract — GateResult and the four quality pillars.
 *
 * Authoritative source: functional-design/domain-entities.md (section A) and
 * business-rules.md (BR-T1 / BR-T1').
 *
 * The four pillars are evaluated with fail-closed AND semantics: the gate
 * passes only when there are exactly 4 results and every one is `PASS`.
 * `PENDING` and `ERROR` are explicitly non-PASS (US-D2 AC2/AC3) — a pending or
 * errored scanner must never be shown as a pass.
 */

/** The four quality pillars. Exactly these four must be present for a PASS. */
export type Pillar = 'test' | 'static' | 'security' | 'deploy';

/**
 * Status of a single pillar evaluation.
 * - `PASS`    — the pillar succeeded.
 * - `FAIL`    — the pillar ran and found blocking issues.
 * - `PENDING` — the pillar has not produced a verdict yet (non-PASS).
 * - `ERROR`   — the pillar crashed / timed out (non-PASS).
 */
export type GateStatus = 'PASS' | 'FAIL' | 'PENDING' | 'ERROR';

/** The result of evaluating one quality pillar. */
export interface GateResult {
  readonly pillar: Pillar;
  readonly status: GateStatus;
  /** Human-facing reason: failing locations / counts. Surfaced on HaltForHuman. */
  readonly details: string;
}

/** The canonical, ordered set of pillars the gate evaluates. */
export const ALL_PILLARS: readonly Pillar[] = [
  'test',
  'static',
  'security',
  'deploy',
] as const;

/** Next state after gate evaluation. The skeleton has no `AutoFix` (that is U6). */
export type GateNextState = 'Deploying' | 'HaltForHuman';

/** Outcome of {@link evaluate}. */
export interface GateVerdict {
  readonly passed: boolean;
  readonly next: GateNextState;
}
