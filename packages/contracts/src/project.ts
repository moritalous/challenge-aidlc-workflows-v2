/**
 * U0 contract — Project / BuildArtifact / GenOutput.
 *
 * Authoritative source: functional-design/domain-entities.md (section A).
 *
 * `Project` is the structural carrier the orchestrator (U7) consumes and the
 * deployer (U5) deploys. The *meaning* of generation — the intent->file mapping
 * — is owned by U3's `GenOutput.filePaths`; `Project` merely transports it as
 * metadata. This keeps the contract a dumb container and avoids cycles.
 */

/** A single generated source file. */
export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
}

/**
 * Traceability map: intent item -> the file paths that satisfy it (FR-1.4).
 * A plain record keyed by intent item; values are the produced file paths.
 */
export type Traceability = Record<string, readonly string[]>;

/**
 * Output of a {@link CodeGenProvider}. Owned by U3. Carries the generated files
 * plus the intent->filePaths traceability that proves coverage.
 */
export interface GenOutput {
  readonly files: readonly GeneratedFile[];
  /** intentItem -> filePaths. The authoritative traceability surface. */
  readonly filePaths: Traceability;
}

/**
 * The generated project contract (BuildArtifact). U8 owns `iacEntry`; U7
 * consumes it. `traceability` is carried as metadata, sourced from GenOutput.
 */
export interface Project {
  readonly id: string;
  readonly files: readonly GeneratedFile[];
  /** CDK entry point path. Owned by U8 (InfraTemplates), consumed by U5/U7. */
  readonly iacEntry: string;
  readonly traceability: Traceability;
}
