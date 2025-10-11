import type { FileIR } from '@shared/types';
import { EmitContext } from './support';
import { emitNodeSequence } from './runner';

export const emitTaskBody = (
  file: FileIR,
  task: NonNullable<FileIR['taskDefs']>[number],
  warnings: Array<{ nodeId?: string; message: string }>,
  parentContext?: EmitContext
): string[] => {
  const nodeMap = new Map(file.nodes.map((node) => [node.id, node]));
  const ctx = new EmitContext(file, nodeMap, warnings);
  if (task.entryNodeId) {
    emitNodeSequence(task.entryNodeId, ctx, nodeMap, new Set(), warnings);
  }
  if (parentContext) {
    parentContext.mergeImportsFrom(ctx);
  }
  return ctx.getStatements();
};
