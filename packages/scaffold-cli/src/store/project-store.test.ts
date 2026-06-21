import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Project } from '@vibe/contracts';
import { ProjectStore, ProjectStoreError } from './project-store.js';

const project: Project = {
  id: 'proj-1',
  files: [{ path: 'a.ts', content: '// x' }],
  iacEntry: 'infra/bin/app.ts',
  traceability: { 'entity:Task': ['a.ts'] },
};

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'vibe-store-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('ProjectStore', () => {
  it('saves and loads a project round-trip', async () => {
    const store = new ProjectStore(dir);
    await store.save(project);
    const loaded = await store.load('proj-1');
    expect(loaded).toEqual(project);
  });

  it('returns null for a missing project (not an error)', async () => {
    const store = new ProjectStore(dir);
    expect(await store.load('does-not-exist')).toBeNull();
  });

  it('throws ProjectStoreError on a corrupt project file', async () => {
    const store = new ProjectStore(dir);
    await writeFile(join(dir, 'bad.json'), '{ not valid json', 'utf8');
    await expect(store.load('bad')).rejects.toBeInstanceOf(ProjectStoreError);
  });

  it('creates the base directory on save if it does not exist', async () => {
    const nested = join(dir, 'a', 'b', 'c');
    const store = new ProjectStore(nested);
    await store.save(project);
    expect(await store.load('proj-1')).toEqual(project);
  });
});
