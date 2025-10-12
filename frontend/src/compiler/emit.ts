import type { CompilerResult, FileIR } from "@shared/types";
import { buildFileIR } from "./graphToIR";
import { EmitContext, type WarningMessage } from "./emitters/support";
import { emitNodeSequence } from "./emitters/runner";
import { emitTaskBody } from "./emitters/tasks";
import { wrapRoleFile } from "./templates/fileBoilerplate";

const compileTasks = (
  file: FileIR,
  ctx: EmitContext,
  warnings: WarningMessage[],
): string[] => {
  if (!file.taskDefs) {
    return [];
  }

  return file.taskDefs.map((task) => {
    const identifier = `task_${task.name.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    const paramsComment = task.params
      ?.map(
        (param) =>
          `${param.key}: ${param.type}${param.default !== undefined ? `=${JSON.stringify(param.default)}` : ""}`,
      )
      .join(", ");
    const body = emitTaskBody(file, task, warnings, ctx);
    const lines: string[] = [];
    lines.push(`function ${identifier}(params: any = {}) {`);
    if (paramsComment) {
      lines.push(`  // params: ${paramsComment}`);
    }
    if (body.length > 0) {
      lines.push(...body);
    } else {
      lines.push("  // Task body is empty.");
    }
    lines.push("}");
    return lines.join("\n");
  });
};

export const compileFile = (file: FileIR): CompilerResult => {
  const warnings: WarningMessage[] = [];
  const nodeMap = new Map(file.nodes.map((node) => [node.id, node]));
  const ctx = new EmitContext(file, nodeMap, warnings);
  emitNodeSequence(file.entryNodeId, ctx, nodeMap, new Set(), warnings);
  const taskBlocks = compileTasks(file, ctx, warnings);
  const code = wrapRoleFile(
    ctx.getImportLines(),
    ctx.getStatements(),
    taskBlocks,
  );

  return {
    code,
    errors: [],
    warnings,
  };
};

export const compileGraphToCode = (
  fileId: string,
  graph: Parameters<typeof buildFileIR>[1],
): CompilerResult => {
  const result = buildFileIR(fileId, graph);
  if (!result.file) {
    return {
      code: "",
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  const compiled = compileFile(result.file);
  return {
    code: compiled.code,
    errors: result.errors,
    warnings: [...result.warnings, ...compiled.warnings],
  };
};
