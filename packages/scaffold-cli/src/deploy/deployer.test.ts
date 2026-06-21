import { describe, it, expect } from 'vitest';
import type { Project } from '@vibe/contracts';
import { Deployer } from './deployer.js';

const project: Project = {
  id: 'p',
  files: [],
  iacEntry: 'infra/bin/app.ts',
  traceability: {},
};

const okCdk = async () => ({ exitCode: 0, stdout: 'done', stderr: '' });

describe('Deployer', () => {
  it('PASS when cdk succeeds and /health returns 200 within budget', async () => {
    const d = new Deployer({
      cdk: okCdk,
      smoke: async () => ({ status: 200, elapsedMs: 120 }),
    });
    const res = await d.deploy(project);
    expect(res.pillar).toBe('deploy');
    expect(res.status).toBe('PASS');
  });

  it('FAIL with rollback steps when cdk exits non-zero', async () => {
    const d = new Deployer({
      cdk: async () => ({ exitCode: 1, stdout: '', stderr: 'stack error' }),
      smoke: async () => ({ status: 200, elapsedMs: 100 }),
    });
    const res = await d.deploy(project);
    expect(res.status).toBe('FAIL');
    expect(res.details).toContain('stack error');
    expect(res.details).toContain('Rollback');
  });

  it('FAIL when /health returns non-200', async () => {
    const d = new Deployer({
      cdk: okCdk,
      smoke: async () => ({ status: 503, elapsedMs: 80 }),
    });
    const res = await d.deploy(project);
    expect(res.status).toBe('FAIL');
    expect(res.details).toContain('503');
  });

  it('FAIL when /health exceeds the 5s budget', async () => {
    const d = new Deployer({
      cdk: okCdk,
      smoke: async () => ({ status: 200, elapsedMs: 6_000 }),
    });
    const res = await d.deploy(project);
    expect(res.status).toBe('FAIL');
    expect(res.details).toContain('budget');
  });

  it('FAIL (not throw) when the cdk runner throws', async () => {
    const d = new Deployer({
      cdk: async () => {
        throw new Error('aws creds missing');
      },
      smoke: async () => ({ status: 200, elapsedMs: 1 }),
    });
    const res = await d.deploy(project);
    expect(res.status).toBe('FAIL');
    expect(res.details).toContain('aws creds missing');
  });

  it('FAIL (not throw) when the smoke check throws', async () => {
    const d = new Deployer({
      cdk: okCdk,
      smoke: async () => {
        throw new Error('connection refused');
      },
    });
    const res = await d.deploy(project);
    expect(res.status).toBe('FAIL');
    expect(res.details).toContain('connection refused');
  });
});
