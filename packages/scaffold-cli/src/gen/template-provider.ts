import type {
  IntentModel,
  GenOutput,
  GeneratedFile,
  Traceability,
} from '@vibe/contracts';
import type { CodeGenProvider } from './provider.js';

/**
 * A deterministic {@link CodeGenProvider} that emits the Task-app vertical slice
 * file list (the generated-app TEMPLATE) with full intent->filePaths
 * traceability. It contains NO secrets and makes NO network calls, so the
 * skeleton's gate and orchestrator are testable end-to-end without an AI vendor.
 *
 * A real AI-backed provider implements the same interface and is injected in its
 * place (ADR-004) — nothing else in the tool changes.
 */
export class TemplateProvider implements CodeGenProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  async generate(intent: IntentModel): Promise<GenOutput> {
    const entityName = intent.entities[0]?.name ?? 'Task';
    const lower = entityName.toLowerCase();

    const files: GeneratedFile[] = [];
    const traceability: Record<string, string[]> = {};

    const add = (intentItem: string, file: GeneratedFile): void => {
      files.push(file);
      (traceability[intentItem] ??= []).push(file.path);
    };

    // entity -> domain types + repository + service (API layer)
    add(`entity:${entityName}`, {
      path: `templates/task-app/api/src/domain/${lower}.ts`,
      content: `// generated: ${entityName} domain type\n`,
    });
    add(`entity:${entityName}`, {
      path: `templates/task-app/api/src/repository/${lower}-repository.ts`,
      content: `// generated: ${entityName} DynamoDB repository\n`,
    });
    add(`entity:${entityName}`, {
      path: `templates/task-app/api/src/service/${lower}-service.ts`,
      content: `// generated: ${entityName} service\n`,
    });

    // operations -> API routes. changeStatus is realized via update(PUT).
    for (const op of intent.operations) {
      const route =
        op === 'changeStatus'
          ? `templates/task-app/api/src/routes/${lower}s.ts (PUT realizes changeStatus)`
          : `templates/task-app/api/src/routes/${lower}s.ts (${op})`;
      add(`operation:${op}`, {
        path: route,
        content: `// generated: route for ${op}\n`,
      });
    }

    // screens -> React components
    for (const screen of intent.screens) {
      add(`screen:${screen}`, {
        path: `templates/task-app/web/src/pages/${screen}.tsx`,
        content: `// generated: ${screen} screen\n`,
      });
    }

    // infra (U8) — always present for the deployable slice
    add('infra:cdk', {
      path: 'templates/task-app/infra/src/app-stack.ts',
      content: '// generated: CDK AppStack\n',
    });

    const trace: Traceability = traceability;
    return { files, filePaths: trace };
  }
}
