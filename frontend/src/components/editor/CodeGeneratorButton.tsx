import { useCallback } from 'react';
import { useFileStore } from '../../state/fileStore';
import { useNodeStore } from '../../state/nodeStore';

type CodeGeneratorButtonProps = {
  onGenerated?: (output: string) => void;
};

/**
 * Button that serialises the active ReactFlow graph and emits a mock payload.
 */
export const CodeGeneratorButton = ({ onGenerated }: CodeGeneratorButtonProps) => {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getFileById = useFileStore((state) => state.getFileById);
  const serializeGraph = useNodeStore((state) => state.serializeGraph);

  const handleGenerate = useCallback(() => {
    if (!activeFileId) {
      return;
    }

    const file = getFileById(activeFileId);
    const graph = serializeGraph(activeFileId);
    const payload = {
      fileId: activeFileId,
      fileName: file?.name ?? 'Unnamed',
      ...graph
    };

    const formatted = JSON.stringify(payload, null, 2);
    console.groupCollapsed(`Mock compiler payload for ${payload.fileName}`);
    console.log(formatted);
    console.groupEnd();
    onGenerated?.(formatted);
  }, [activeFileId, getFileById, onGenerated, serializeGraph]);

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={handleGenerate}
      disabled={!activeFileId}
    >
      Generate Code
    </button>
  );
};
