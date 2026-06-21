/**
 * @vibe/scaffold-cli — public API barrel.
 *
 * The scaffold TOOL: intent -> AI-generate -> 4-pillar fail-closed quality gate
 * -> AWS deploy. Every export depends only on the U0 contract (@vibe/contracts).
 */
export { evaluate, failingPillars } from './gate/evaluate.js';
export {
  runGate,
  type PillarRunner,
  type PillarRunners,
  type GateContext,
  type GateRun,
} from './gate/quality-gate.js';

export { parseIntent, MissingIntentError } from './intent/parser.js';

export type { CodeGenProvider } from './gen/provider.js';
export { TemplateProvider } from './gen/template-provider.js';
export { Generator, type GenerateOptions } from './gen/generator.js';

export { ProjectStore, ProjectStoreError } from './store/project-store.js';

export {
  Deployer,
  type DeployerDeps,
  type CdkRunner,
  type SmokeCheck,
  type Result,
  type CdkResult,
} from './deploy/deployer.js';

export {
  CliOrchestrator,
  buildHaltMessage,
  type OrchestratorState,
  type OrchestratorDeps,
  type Reviewer,
  type RunOutcome,
  type TransitionLog,
} from './orchestrator.js';

export {
  defaultRunners,
  testRunner,
  staticRunner,
  securityRunner,
  makeDeployRunner,
} from './runners.js';
