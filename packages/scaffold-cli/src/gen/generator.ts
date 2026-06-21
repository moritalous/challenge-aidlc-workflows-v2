import type { IntentModel, Project } from '@vibe/contracts';
import type { CodeGenProvider } from './provider.js';

/** Options for {@link Generator.generate}. */
export interface GenerateOptions {
  /** Project id (e.g. a UUID or slug). */
  readonly projectId: string;
}

/**
 * Generator (U3) — composes a {@link Project} (U0 contract) from a provider's
 * {@link GenOutput}. The AI model is fully isolated behind the injected
 * {@link CodeGenProvider} (ADR-004); the generator only wires the output into the
 * structural Project contract and carries the traceability through as metadata.
 */
export class Generator {
  constructor(private readonly provider: CodeGenProvider) {}

  /**
   * @param intent The parsed intent.
   * @param opts Generation options (project id).
   * @returns A Project carrying files, the CDK entry, and traceability.
   * @throws Error if the provider produced no files (fail loud, no silent empty).
   */
  async generate(intent: IntentModel, opts: GenerateOptions): Promise<Project> {
    const output = await this.provider.generate(intent);

    if (output.files.length === 0) {
      throw new Error('code generation produced no files');
    }

    const iacEntry = 'templates/task-app/infra/src/bin/app.ts';

    return {
      id: opts.projectId,
      files: output.files,
      iacEntry,
      traceability: output.filePaths,
    };
  }
}
