/**
 * @vibe/contracts — U0 contract barrel.
 *
 * Every other unit depends only on this package's types (logical-components.md:
 * "全コンポーネントは U0契約に依存し、相互の実体には依存しない"). Keep this
 * dependency-free so the dependency graph stays acyclic.
 */
export type {
  EntityField,
  IntentEntity,
  Screen,
  Operation,
  IntentModel,
} from './intent.js';
export { ALL_OPERATIONS } from './intent.js';

export type {
  Pillar,
  GateStatus,
  GateResult,
  GateNextState,
  GateVerdict,
} from './gate.js';
export { ALL_PILLARS } from './gate.js';

export type {
  GeneratedFile,
  Traceability,
  GenOutput,
  Project,
} from './project.js';
