import type { IntentModel, GenOutput } from '@vibe/contracts';

/**
 * CodeGenProvider (U3 / ADR-004) — the seam that isolates the AI model.
 *
 * The orchestrator never talks to an AI vendor directly; it talks to this
 * interface. Swapping the model (or using a deterministic template provider in
 * tests/skeleton) is a constructor-injection change, not a code change. No
 * secrets ever live in an implementation — API keys / AWS creds are read from the
 * environment by the concrete provider at call time (security-design SEC-T5).
 */
export interface CodeGenProvider {
  /** Produces generated files + intent->filePaths traceability for an intent. */
  generate(intent: IntentModel): Promise<GenOutput>;
}
