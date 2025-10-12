import { useCallback } from 'react';
import { useFileStore } from '../../state/fileStore';
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
  const getGraphState = useFileStore((state) => state.getGraphState);

  const handleGenerate = useCallback(() => {
    if (!activeFileId) {
      return;
    }

    const graph = getGraphState(activeFileId);
    if (!graph) {
      onGenerated?.('// Nothing to compile yet. Draw a graph for the active file.');
      return;
    }

    const result = compileGraph(activeFileId, graph);

    if (result.errors.length > 0) {
      console.group(`Compile errors for ${activeFileId}`);
      result.errors.forEach((error) => console.error(error.message));
      console.groupEnd();
      onGenerated?.('// Compilation failed. Resolve node errors to generate code.');
      return;
    }

    if (result.warnings.length > 0) {
      console.group(`Compile warnings for ${activeFileId}`);
      result.warnings.forEach((warning) => console.warn(warning.message));
      console.groupEnd();
    }

    console.group(`Generated TypeScript for ${activeFileId}`);
    console.log(result.code);
    console.groupEnd();
    onGenerated?.(result.code);
  }, [activeFileId, getGraphState, onGenerated]);

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
