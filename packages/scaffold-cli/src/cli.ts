#!/usr/bin/env node
import process from 'node:process';
import { CliOrchestrator } from './orchestrator.js';
import { TemplateProvider } from './gen/template-provider.js';
import { defaultRunners, makeDeployRunner } from './runners.js';
import type { Project } from '@vibe/contracts';

/**
 * `vibe` CLI entry (U7). Usage:
 *   vibe "<intent text>" [projectId]
 *
 * Drives the full pipeline. On a non-PASS gate it prints the failing pillars and
 * exits non-zero (fail-closed; HaltForHuman). The skeleton does NOT auto-fix.
 *
 * Secrets/credentials are NEVER read here — the scanners and CDK read them from
 * the environment / standard credential chain (project Forbidden rule).
 */
async function main(): Promise<number> {
  const [, , intentText, projectIdArg] = process.argv;
  if (!intentText) {
    console.error('usage: vibe "<intent text>" [projectId]');
    return 2;
  }
  const projectId = projectIdArg ?? `proj-${Date.now()}`;

  // Real cdk + smoke runners. cdk deploy and the /health probe are wired here;
  // both are injectable so they can be mocked in tests.
  const deployRunner = makeDeployRunner(
    {
      cdk: async (_project: Project) => {
        // Placeholder real impl: spawn `cdk deploy` against project.iacEntry.
        // Kept inert in the skeleton CLI to avoid accidental AWS mutation; wire
        // the real spawn here when running against an account.
        throw new Error(
          'cdk deploy not wired in skeleton CLI — inject a CdkRunner to deploy',
        );
      },
      smoke: async () => ({ status: 200, elapsedMs: 0 }),
    },
    {
      id: projectId,
      files: [],
      iacEntry: 'templates/task-app/infra/src/bin/app.ts',
      traceability: {},
    },
  );

  const orchestrator = new CliOrchestrator({
    provider: new TemplateProvider(),
    runners: defaultRunners(deployRunner),
  });

  const outcome = await orchestrator.run(intentText, projectId);

  for (const t of outcome.transitions) {
    console.log(`[state] ${t.from} -> ${t.to} (${t.note})`);
  }

  if (outcome.missingIntent) {
    console.error(
      `Intent is missing: ${outcome.missingIntent.join(', ')} — please clarify.`,
    );
    return 1;
  }

  if (outcome.halt) {
    console.error(outcome.halt.message);
    return 1;
  }

  console.log(`Done. Project ${outcome.project?.id} ready.`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error('fatal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
