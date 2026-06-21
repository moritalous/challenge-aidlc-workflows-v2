import { describe, it, expect } from 'vitest';
import type { IntentModel, GenOutput } from '@vibe/contracts';
import type { CodeGenProvider } from './provider.js';
import { TemplateProvider } from './template-provider.js';
import { Generator } from './generator.js';

const intent: IntentModel = {
  entities: [
    {
      name: 'Task',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'status', type: 'string' },
      ],
    },
  ],
  operations: ['create', 'update', 'delete', 'changeStatus'],
  screens: ['list', 'detail', 'create', 'confirm', 'empty'],
};

describe('TemplateProvider', () => {
  it('emits files with intent->filePaths traceability', async () => {
    const out = await new TemplateProvider().generate(intent);
    expect(out.files.length).toBeGreaterThan(0);
    expect(Object.keys(out.filePaths).length).toBeGreaterThan(0);
  });

  it('traceability covers each operation including changeStatus', async () => {
    const out = await new TemplateProvider().generate(intent);
    expect(out.filePaths['operation:changeStatus']).toBeDefined();
    expect(out.filePaths['operation:create']).toBeDefined();
    // changeStatus maps to a PUT route (realized as update).
    const csPaths = out.filePaths['operation:changeStatus'] ?? [];
    expect(csPaths.some((p) => p.includes('PUT'))).toBe(true);
  });

  it('every traced file path actually appears in files (no dangling trace)', async () => {
    const out = await new TemplateProvider().generate(intent);
    const filePaths = new Set(out.files.map((f) => f.path));
    for (const paths of Object.values(out.filePaths)) {
      for (const p of paths) {
        expect(filePaths.has(p)).toBe(true);
      }
    }
  });
});

describe('Generator', () => {
  it('composes a Project carrying files, iacEntry and traceability', async () => {
    const gen = new Generator(new TemplateProvider());
    const project = await gen.generate(intent, { projectId: 'proj-1' });
    expect(project.id).toBe('proj-1');
    expect(project.files.length).toBeGreaterThan(0);
    expect(project.iacEntry).toContain('bin/app.ts');
    expect(Object.keys(project.traceability).length).toBeGreaterThan(0);
  });

  it('is provider-swappable (ADR-004) — accepts any CodeGenProvider', async () => {
    const fake: CodeGenProvider = {
      generate: async (): Promise<GenOutput> => ({
        files: [{ path: 'a.ts', content: '// x' }],
        filePaths: { 'entity:Task': ['a.ts'] },
      }),
    };
    const project = await new Generator(fake).generate(intent, {
      projectId: 'proj-2',
    });
    expect(project.files).toHaveLength(1);
    expect(project.files[0]?.path).toBe('a.ts');
  });

  it('throws (fails loud) when the provider produces no files', async () => {
    const empty: CodeGenProvider = {
      generate: async (): Promise<GenOutput> => ({ files: [], filePaths: {} }),
    };
    await expect(
      new Generator(empty).generate(intent, { projectId: 'p' }),
    ).rejects.toThrow(/no files/);
  });
});
