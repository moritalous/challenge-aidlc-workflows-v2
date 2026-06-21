import type { GateResult, IntentModel, Project } from '@vibe/contracts';
import { parseIntent, MissingIntentError } from './intent/parser.js';
import { Generator } from './gen/generator.js';
import type { CodeGenProvider } from './gen/provider.js';
import {
  runGate,
  type PillarRunners,
  type GateContext,
} from './gate/quality-gate.js';
import { failingPillars } from './gate/evaluate.js';

/**
 * States of the scaffold state machine (business-logic-model.md).
 * The skeleton path never enters AutoFix/Escalation (U6). A non-PASS gate goes
 * to `HaltForHuman`, which stops once and surfaces failing pillars (BR-T1').
 */
export type OrchestratorState =
  | 'Idle'
  | 'Parsing'
  | 'Reviewing'
  | 'Generating'
  | 'Gating'
  | 'Deploying'
  | 'HaltForHuman'
  | 'Done';

/** Reviewer gate: returns true to approve generation (Reviewing -> Generating). */
export type Reviewer = (intent: IntentModel) => boolean | Promise<boolean>;

/** Injected collaborators for the orchestrator. */
export interface OrchestratorDeps {
  readonly provider: CodeGenProvider;
  readonly runners: PillarRunners;
  /** Approves an intent; defaults to auto-approve when omitted. */
  readonly reviewer?: Reviewer;
  /** Gate context overrides (timeout). projectDir is filled by the run. */
  readonly gateContext?: Partial<Omit<GateContext, 'projectDir'>>;
}

/** A single transition record, for observability/testing. */
export interface TransitionLog {
  readonly from: OrchestratorState;
  readonly to: OrchestratorState;
  readonly note: string;
}

/** Final outcome of a run. */
export interface RunOutcome {
  readonly finalState: OrchestratorState;
  readonly transitions: readonly TransitionLog[];
  readonly project?: Project;
  readonly gateResults?: readonly GateResult[];
  /** Populated only on HaltForHuman: the failing pillars + reasons. */
  readonly halt?: {
    readonly failing: readonly GateResult[];
    readonly message: string;
  };
  /** Populated when the intent was missing info (routed back to Reviewing). */
  readonly missingIntent?: readonly string[];
}

/**
 * CliOrchestrator (U7) — drives Idle -> Parsing -> Reviewing -> Generating ->
 * Gating -> (Deploying | HaltForHuman). It is the only place the units are
 * coordinated; each unit depends solely on the U0 contract (no cycles).
 *
 * Crucially, the skeleton does NOT auto-fix: a non-PASS gate ends the run in
 * `HaltForHuman` with the failing pillars listed. There is no retry, no counter,
 * no escalation (those are U6).
 */
export class CliOrchestrator {
  private readonly generator: Generator;
  private readonly reviewer: Reviewer;
  private readonly transitions: TransitionLog[] = [];
  private state: OrchestratorState = 'Idle';

  constructor(private readonly deps: OrchestratorDeps) {
    this.generator = new Generator(deps.provider);
    this.reviewer = deps.reviewer ?? (() => true);
  }

  private transition(to: OrchestratorState, note: string): void {
    this.transitions.push({ from: this.state, to, note });
    this.state = to;
  }

  /**
   * Runs the full pipeline for an intent text.
   * @param intentText Free-form intent.
   * @param projectId Id for the generated project.
   */
  async run(intentText: string, projectId: string): Promise<RunOutcome> {
    // Idle -> Parsing
    this.transition('Parsing', 'received intent');

    let intent: IntentModel;
    try {
      intent = parseIntent(intentText);
    } catch (err) {
      if (err instanceof MissingIntentError) {
        // Missing info routes back to Reviewing for confirmation (BR-T4).
        this.transition(
          'Reviewing',
          `missing intent: ${err.missing.join(',')}`,
        );
        return {
          finalState: this.state,
          transitions: [...this.transitions],
          missingIntent: err.missing,
        };
      }
      throw err;
    }

    // Parsing -> Reviewing
    this.transition('Reviewing', 'intent parsed; awaiting approval');
    const approved = await this.reviewer(intent);
    if (!approved) {
      return {
        finalState: this.state,
        transitions: [...this.transitions],
      };
    }

    // Reviewing -> Generating
    this.transition('Generating', 'approved');
    const project = await this.generator.generate(intent, { projectId });

    // Generating -> Gating
    this.transition('Gating', `generated ${project.files.length} files`);
    const { results, verdict } = await runGate(this.deps.runners, {
      projectDir: `/tmp/${projectId}`,
      ...(this.deps.gateContext?.timeoutMs !== undefined
        ? { timeoutMs: this.deps.gateContext.timeoutMs }
        : {}),
    });

    if (!verdict.passed) {
      // Skeleton: stop once, surface failing pillars. NO auto-fix (BR-T1').
      const failing = failingPillars(results);
      const message = buildHaltMessage(failing);
      this.transition('HaltForHuman', 'gate non-PASS; no auto-fix (skeleton)');
      return {
        finalState: this.state,
        transitions: [...this.transitions],
        project,
        gateResults: results,
        halt: { failing, message },
      };
    }

    // Gating -> Deploying -> Done
    this.transition('Deploying', 'all 4 pillars PASS');
    this.transition('Done', 'deployed');
    return {
      finalState: this.state,
      transitions: [...this.transitions],
      project,
      gateResults: results,
    };
  }
}

/** Builds the human-facing HaltForHuman message (failing pillars + reasons). */
export function buildHaltMessage(failing: readonly GateResult[]): string {
  if (failing.length === 0) {
    return 'Gate did not pass (incomplete result set).';
  }
  const lines = failing.map(
    (r) => `  - ${r.pillar} [${r.status}]: ${r.details}`,
  );
  return [
    'Quality gate did not pass. The skeleton stops here (no auto-fix).',
    'Failing pillars:',
    ...lines,
    'Fix the issues above and re-run the gate.',
  ].join('\n');
}
