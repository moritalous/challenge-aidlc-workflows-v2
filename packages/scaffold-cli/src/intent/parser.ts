import type {
  IntentModel,
  IntentEntity,
  Operation,
  Screen,
} from '@vibe/contracts';

/**
 * Thrown when the parsed intent is missing required information (BR-T4 /
 * FR-1.1 / US-A2 AC3): no entities, or an entity with no fields. The orchestrator
 * catches this and routes back to `Reviewing` for a summary-confirmation rather
 * than generating from an incomplete intent.
 */
export class MissingIntentError extends Error {
  readonly missing: readonly string[];
  constructor(missing: readonly string[]) {
    super(`intent is missing required information: ${missing.join(', ')}`);
    this.name = 'MissingIntentError';
    this.missing = missing;
  }
}

/** Verbs that imply a status-changing operation -> retains `changeStatus`. */
const STATUS_VERBS = [
  'status',
  'transition',
  'move',
  'complete',
  'done',
  'progress',
  'state',
];

/** Verbs implying mutation -> `update`. */
const UPDATE_VERBS = ['update', 'edit', 'change', 'modify', 'rename'];

/** Verbs implying deletion -> `delete`. */
const DELETE_VERBS = ['delete', 'remove', 'archive'];

/**
 * A naive, deterministic intent parser (U2). It is NOT an AI model — the skeleton
 * keeps generation deterministic so the gate is testable. It detects:
 *  - the primary entity (defaults to `Task` for the reference CRUD slice),
 *  - which operations the text implies (always includes `create`),
 *  - and preserves `changeStatus` whenever status-changing verbs appear.
 *
 * @param text Free-form intent description.
 * @returns A complete {@link IntentModel}.
 * @throws {MissingIntentError} when no entity can be derived.
 */
export function parseIntent(text: string): IntentModel {
  const normalized = text.trim().toLowerCase();
  if (normalized.length === 0) {
    throw new MissingIntentError(['entities']);
  }

  const entities = deriveEntities(normalized);
  if (entities.length === 0) {
    throw new MissingIntentError(['entities']);
  }
  const entitiesWithoutFields = entities.filter((e) => e.fields.length === 0);
  if (entitiesWithoutFields.length > 0) {
    throw new MissingIntentError(
      entitiesWithoutFields.map((e) => `fields:${e.name}`),
    );
  }

  const operations = deriveOperations(normalized);
  const screens = deriveScreens(operations);

  return { entities, operations, screens };
}

/**
 * Derives entities from the text. The skeleton recognizes the `Task` reference
 * entity; any non-empty intent yields at least the Task slice so the walking
 * skeleton always produces a runnable vertical slice.
 */
function deriveEntities(text: string): IntentEntity[] {
  const taskFields: IntentEntity['fields'] = [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'dueDate', type: 'string' },
  ];

  // Skeleton scope: the reference slice is always `Task`. Future Bolts extend
  // IntentModel.entities; here we anchor on the well-known noun.
  if (text.includes('task') || text.includes('todo') || text.includes('crud')) {
    return [{ name: 'Task', fields: taskFields }];
  }

  // Unknown noun but non-empty intent: still emit the reference Task slice so the
  // skeleton is exercisable, but flag nothing (the gate will catch real issues).
  return [{ name: 'Task', fields: taskFields }];
}

/** Derives the operation set. `create` is always present; others are additive. */
function deriveOperations(text: string): Operation[] {
  const ops = new Set<Operation>(['create']);

  if (UPDATE_VERBS.some((v) => text.includes(v))) {
    ops.add('update');
  }
  if (DELETE_VERBS.some((v) => text.includes(v))) {
    ops.add('delete');
  }
  if (STATUS_VERBS.some((v) => text.includes(v))) {
    // U0 invariant: keep `changeStatus` in operations when status-changing verbs
    // are present. Realized downstream as a plain update(PUT) of `status`.
    ops.add('changeStatus');
    ops.add('update');
  }

  return [...ops];
}

/** Maps the operation set to the screens the app needs. */
function deriveScreens(operations: readonly Operation[]): Screen[] {
  const screens = new Set<Screen>(['list', 'empty']);
  if (operations.includes('create')) {
    screens.add('create');
  }
  if (operations.includes('update') || operations.includes('changeStatus')) {
    screens.add('detail');
  }
  if (operations.includes('delete')) {
    screens.add('confirm');
  }
  return [...screens];
}
