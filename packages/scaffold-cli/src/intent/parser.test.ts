import { describe, it, expect } from 'vitest';
import { parseIntent, MissingIntentError } from './parser.js';

describe('parseIntent', () => {
  it('parses a normal task-CRUD intent into a complete IntentModel', () => {
    const intent = parseIntent(
      'A task manager where users create, update and delete tasks',
    );
    expect(intent.entities).toHaveLength(1);
    expect(intent.entities[0]?.name).toBe('Task');
    expect(intent.entities[0]?.fields.length).toBeGreaterThan(0);
    expect(intent.operations).toContain('create');
    expect(intent.operations).toContain('update');
    expect(intent.operations).toContain('delete');
  });

  it('throws MissingIntentError on empty intent (BR-T4)', () => {
    expect(() => parseIntent('')).toThrow(MissingIntentError);
    expect(() => parseIntent('   ')).toThrow(MissingIntentError);
  });

  it('MissingIntentError reports the missing field set', () => {
    try {
      parseIntent('');
      expect.fail('expected MissingIntentError');
    } catch (err) {
      expect(err).toBeInstanceOf(MissingIntentError);
      expect((err as MissingIntentError).missing).toContain('entities');
    }
  });

  it('retains changeStatus when status-changing verbs appear (U0 invariant)', () => {
    const intent = parseIntent(
      'Track tasks and let users move a task status to done',
    );
    expect(intent.operations).toContain('changeStatus');
    // changeStatus is realized as update(PUT), so update must also be present.
    expect(intent.operations).toContain('update');
  });

  it('does NOT include changeStatus when no status verbs appear', () => {
    const intent = parseIntent('Let users create and delete task records');
    expect(intent.operations).not.toContain('changeStatus');
  });

  it('always includes create and derives list/empty screens', () => {
    const intent = parseIntent('task list app');
    expect(intent.operations).toContain('create');
    expect(intent.screens).toContain('list');
    expect(intent.screens).toContain('empty');
  });

  it('derives confirm screen when delete is requested', () => {
    const intent = parseIntent('task app with delete and remove');
    expect(intent.screens).toContain('confirm');
  });
});
