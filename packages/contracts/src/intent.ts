/**
 * U0 contract — IntentModel.
 *
 * The stable, AI-model-agnostic schema for a parsed user intent (ADR-004).
 * Authoritative source: functional-design/domain-entities.md (section A).
 *
 * IMPORTANT (U0 invariant): `Operation` MUST include `changeStatus`. In the
 * walking skeleton, `changeStatus` is realized as a plain `update` (PUT) of the
 * `status` field — there is no dedicated transition rule or transition UI. The
 * contract value is never dropped downstream; only the *transition rules* are
 * out of skeleton scope (see domain-entities.md F2 note).
 */

/** A single field on a generated domain entity. */
export interface EntityField {
  readonly name: string;
  readonly type: string;
}

/** A domain entity to be generated (e.g. `Task`). */
export interface IntentEntity {
  readonly name: string;
  readonly fields: readonly EntityField[];
}

/** Screen kinds the generated app can produce. */
export type Screen = 'list' | 'detail' | 'create' | 'confirm' | 'empty';

/**
 * Operations the generated app supports.
 *
 * `changeStatus` is part of the U0 contract and must be preserved by every
 * downstream unit. The skeleton implements it as a plain `update`.
 */
export type Operation = 'create' | 'update' | 'delete' | 'changeStatus';

/** The parsed, stable representation of a user intent. */
export interface IntentModel {
  readonly entities: readonly IntentEntity[];
  readonly screens: readonly Screen[];
  readonly operations: readonly Operation[];
}

/** The complete, ordered set of operations defined by the U0 contract. */
export const ALL_OPERATIONS: readonly Operation[] = [
  'create',
  'update',
  'delete',
  'changeStatus',
] as const;
