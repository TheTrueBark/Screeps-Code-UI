import { useCallback } from 'react';
import type { GraphNodeData } from '@shared/types';
import { useFileStore } from '../../state/fileStore';
import { useNodeStore } from '../../state/nodeStore';
import { compileGraph } from '../../compiler';
import { cn } from '../../utils/classNames';

type CodeGeneratorButtonProps = {
  onGenerated?: (output: string) => void;
  className?: string;
};

/**
 * Button that serialises the active ReactFlow graph and emits a mock payload.
 */
export const CodeGeneratorButton = ({ onGenerated, className }: CodeGeneratorButtonProps) => {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getFileById = useFileStore((state) => state.getFileById);
  const serializeGraph = useNodeStore((state) => state.serializeGraph);
  const getGraphState = useNodeStore((state) => state.getGraphForFile);
  const setGraphState = useNodeStore((state) => state.setGraphState);

  const handleGenerate = useCallback(() => {
    if (!activeFileId) {
      return;
    }

    const file = getFileById(activeFileId);
    const graph = serializeGraph(activeFileId);
    const result = compileGraph(activeFileId, graph);

    const flowGraph = getGraphState(activeFileId);
    const errorsByNode = new Map<string, string[]>();
    result.errors.forEach((diagnostic) => {
      if (!diagnostic.nodeId) {
        return;
      }
      const current = errorsByNode.get(diagnostic.nodeId) ?? [];
      current.push(diagnostic.message);
      errorsByNode.set(diagnostic.nodeId, current);
    });

    const warningsByNode = new Map<string, string[]>();
    result.warnings.forEach((diagnostic) => {
      if (!diagnostic.nodeId) {
        return;
      }
      const current = warningsByNode.get(diagnostic.nodeId) ?? [];
      current.push(diagnostic.message);
      warningsByNode.set(diagnostic.nodeId, current);
    });

    const annotatedNodes = flowGraph.nodes.map((node) => ({
      ...node,
      data: {
        ...(node.data as GraphNodeData),
        errors: errorsByNode.get(node.id),
        warnings: warningsByNode.get(node.id)
      }
    }));

    setGraphState(activeFileId, annotatedNodes, flowGraph.edges);

    if (result.errors.length > 0) {
      console.group(`Compile errors for ${file?.name ?? activeFileId}`);
      result.errors.forEach((error) => console.error(error.message));
      console.groupEnd();
      onGenerated?.('// Compilation failed. Resolve node errors to generate code.');
      return;
    }

    console.group(`Generated TypeScript for ${file?.name ?? activeFileId}`);
    console.log(result.code);
    console.groupEnd();
    onGenerated?.(result.code);
  }, [activeFileId, getFileById, getGraphState, onGenerated, serializeGraph, setGraphState]);

  return (
    <button
      type="button"
      className={cn('btn-generate', className, { disabled: !activeFileId })}
      onClick={handleGenerate}
      disabled={!activeFileId}
      aria-label="Generate code for the active file"
    >
      <span>Generate</span>
    </button>
  );
};
