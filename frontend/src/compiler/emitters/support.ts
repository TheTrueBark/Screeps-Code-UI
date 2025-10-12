import type { FileIR, NodeIR, PortRef } from "@shared/types";

export type WarningMessage = { nodeId?: string; message: string };

const literalToExpression = (value: unknown): string => {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => literalToExpression(entry)).join(", ")}]`;
  }
  if (typeof value === "object") {
    return `{ ${Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${literalToExpression(val)}`)
      .join(", ")} }`;
  }
  return JSON.stringify(value);
};

export const toObjectLiteral = (
  value: Record<string, unknown> | undefined,
): string => {
  if (!value) {
    return "{}";
  }
  const filtered = Object.entries(value).filter(([, v]) => v !== undefined);
  if (filtered.length === 0) {
    return "{}";
  }
  return `{ ${filtered.map(([key, val]) => `${key}: ${literalToExpression(val)}`).join(", ")} }`;
};

export class EmitContext {
  private counter = 0;
  private statements: string[] = [];
  private indentLevel = 2;
  private valueRefs = new Map<string, string>();
  private imports = new Map<string, Map<string, string>>();
  private usedAliases = new Set<string>();
  private queue: string[] = [];

  constructor(
    readonly file: FileIR,
    private readonly nodeMap: Map<string, NodeIR>,
    private readonly warnings: WarningMessage[],
  ) {}

  newTemp(prefix: string) {
    this.counter += 1;
    return `${prefix}_${this.counter}`;
  }

  pushStatement(statement: string) {
    const indent = " ".repeat(this.indentLevel);
    this.statements.push(`${indent}${statement}`);
  }

  withBlock(header: string, body: () => void) {
    this.pushStatement(`${header} {`);
    this.indentLevel += 2;
    body();
    this.indentLevel -= 2;
    this.pushStatement("}");
  }

  emitBlock(lines: string[]): string {
    const indent = " ".repeat(this.indentLevel);
    return [
      `${indent}{`,
      ...lines.map((line) => `${indent}  ${line}`),
      `${indent}}`,
    ].join("\n");
  }

  enterScope() {
    this.indentLevel += 2;
  }

  exitScope() {
    this.indentLevel = Math.max(0, this.indentLevel - 2);
  }

  enqueue(nodeIds: string[]) {
    this.queue.push(...nodeIds);
  }

  drainQueue(): string[] {
    const pending = [...this.queue];
    this.queue.length = 0;
    return pending;
  }

  setValue(nodeId: string, expression: string) {
    this.valueRefs.set(nodeId, expression);
  }

  resolvePort(
    nodeId: string,
    ref: PortRef | undefined,
    fallback?: unknown,
  ): string {
    if (!ref) {
      return literalToExpression(fallback);
    }

    if (ref.refType === "literal") {
      return literalToExpression(ref.value);
    }

    const resolved = this.valueRefs.get(ref.fromNodeId);
    if (!resolved) {
      this.warnings.push({
        nodeId,
        message: `Unable to resolve data from node ${ref.fromNodeId}.`,
      });
      return "undefined";
    }

    return resolved;
  }

  requireImport(spec: string, from: string): string {
    if (!this.imports.has(from)) {
      this.imports.set(from, new Map());
    }
    const moduleImports = this.imports.get(from)!;
    if (moduleImports.has(spec)) {
      return moduleImports.get(spec)!;
    }
    const baseAlias = spec.replace(/[^a-zA-Z0-9_]/g, "_");
    let alias = baseAlias;
    let suffix = 1;
    while (this.usedAliases.has(alias)) {
      alias = `${baseAlias}_${suffix}`;
      suffix += 1;
    }
    this.usedAliases.add(alias);
    moduleImports.set(spec, alias);
    return alias;
  }

  getImportLines(): string[] {
    const lines: string[] = [];
    this.imports.forEach((specs, from) => {
      const entries = Array.from(specs.entries()).map(([spec, alias]) =>
        spec === alias ? spec : `${spec} as ${alias}`,
      );
      lines.push(`import { ${entries.join(", ")} } from '${from}';`);
    });
    return lines.sort();
  }

  mergeImportsFrom(other: EmitContext) {
    other.imports.forEach((specs, from) => {
      specs.forEach((_alias, spec) => {
        this.requireImport(spec, from);
      });
    });
  }

  getStatements() {
    return this.statements;
  }

  getNode(nodeId: string) {
    return this.nodeMap.get(nodeId);
  }
}
