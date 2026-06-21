import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Project } from '@vibe/contracts';

/** Error thrown when a project cannot be persisted or loaded. */
export class ProjectStoreError extends Error {
  constructor(
    message: string,
    readonly reason?: unknown,
  ) {
    super(message);
    this.name = 'ProjectStoreError';
  }
}

/**
 * ProjectStore (U1) — persists generated projects + progress to the local
 * filesystem as JSON. It is the durable substrate for the future U6 `abort`
 * escalation (BR-T7) but is included in the skeleton so that capability is free
 * later. All filesystem boundaries are wrapped: failures surface as
 * {@link ProjectStoreError}, never silent (construction-phase error rule).
 */
export class ProjectStore {
  constructor(private readonly baseDir: string) {}

  private pathFor(id: string): string {
    return join(this.baseDir, `${id}.json`);
  }

  /**
   * Persists a project as `<baseDir>/<id>.json`.
   * @throws {ProjectStoreError} on any write failure.
   */
  async save(project: Project): Promise<void> {
    const target = this.pathFor(project.id);
    try {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, JSON.stringify(project, null, 2), 'utf8');
    } catch (err) {
      throw new ProjectStoreError(
        `failed to save project "${project.id}"`,
        err,
      );
    }
  }

  /**
   * Loads a previously-saved project by id.
   * @returns The project, or `null` if no file exists for the id.
   * @throws {ProjectStoreError} on read/parse failures other than not-found.
   */
  async load(id: string): Promise<Project | null> {
    const target = this.pathFor(id);
    let raw: string;
    try {
      raw = await readFile(target, 'utf8');
    } catch (err) {
      if (
        err instanceof Error &&
        (err as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return null;
      }
      throw new ProjectStoreError(`failed to read project "${id}"`, err);
    }
    try {
      return JSON.parse(raw) as Project;
    } catch (err) {
      throw new ProjectStoreError(`corrupt project file for "${id}"`, err);
    }
  }
}
