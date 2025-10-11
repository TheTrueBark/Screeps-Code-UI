import classNames from 'classnames';
import { useCallback, useState, type KeyboardEvent } from 'react';
import {
  useFileStore,
  type FileNode,
  type FolderNode,
  type TreeNode
} from '../../state/fileStore';
import { useNodeStore } from '../../state/nodeStore';
import { findNodeById } from '../../utils/fileHelpers';

/**
 * VSCode-like file tree for organising virtual Screeps files.
 */
export const FileTree = () => {
  const tree = useFileStore((state) => state.tree);
  const collapsedFolders = useFileStore((state) => state.collapsedFolders);
  const openFile = useFileStore((state) => state.openFile);
  const createFile = useFileStore((state) => state.createFile);
  const createFolder = useFileStore((state) => state.createFolder);
  const renameItem = useFileStore((state) => state.renameItem);
  const toggleFolder = useFileStore((state) => state.toggleFolder);
  const getFileById = useFileStore((state) => state.getFileById);
  const initializeGraph = useNodeStore((state) => state.initializeGraphForFile);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const startRename = useCallback((node: TreeNode) => {
    setEditingId(node.id);
    setDraftName(node.name);
  }, []);

  const commitRename = useCallback(() => {
    if (!editingId) {
      return;
    }

    renameItem(editingId, draftName);
    setEditingId(null);
  }, [draftName, editingId, renameItem]);

  const handleInputKey = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        commitRename();
      }
      if (event.key === 'Escape') {
        setEditingId(null);
      }
    },
    [commitRename]
  );

  const handleFileOpen = useCallback(
    (fileId: string) => {
      openFile(fileId);
      initializeGraph(fileId);
    },
    [initializeGraph, openFile]
  );

  const handleCreateFile = useCallback(
    (parentId: string | null) => {
      const id = createFile(parentId);
      initializeGraph(id);
      openFile(id);
      const file = getFileById(id);
      setEditingId(id);
      setDraftName(file?.name ?? 'New File.ts');
    },
    [createFile, getFileById, initializeGraph, openFile]
  );

  const handleCreateFolder = useCallback((parentId: string | null) => {
    const id = createFolder(parentId);
    const newTree = useFileStore.getState().tree;
    const folder = findNodeById(newTree, id) as FolderNode | undefined;
    setEditingId(id);
    setDraftName(folder?.name ?? 'New Folder');
  }, [createFolder]);

  const renderFolderChildren = (folder: FolderNode, depth: number) => {
    if (collapsedFolders[folder.id]) {
      return null;
    }

    return folder.children.map((child) => renderNode(child, depth + 1));
  };

  const renderNode = (node: TreeNode, depth: number): JSX.Element => {
    const isEditing = editingId === node.id;
    const paddingStyle = { paddingLeft: `${depth * 1.25}rem` };

    if (node.type === 'folder') {
      const collapsed = collapsedFolders[node.id];
      return (
        <div key={node.id} className="tree-group">
          <div className="tree-item" style={paddingStyle}>
            <button
              type="button"
              className="tree-toggle"
              onClick={() => toggleFolder(node.id)}
              aria-label={collapsed ? 'Expand folder' : 'Collapse folder'}
            >
              {collapsed ? '▸' : '▾'}
            </button>
            {isEditing ? (
              <input
                autoFocus
                className="tree-input"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onBlur={commitRename}
                onKeyDown={handleInputKey}
              />
            ) : (
              <span className="tree-label" onDoubleClick={() => startRename(node)}>
                {node.name}
              </span>
            )}
            <div className="tree-actions">
              <button
                type="button"
                className="tree-action"
                title="New file"
                onClick={() => handleCreateFile(node.id)}
              >
                ＋F
              </button>
              <button
                type="button"
                className="tree-action"
                title="New folder"
                onClick={() => handleCreateFolder(node.id)}
              >
                ＋D
              </button>
              <button
                type="button"
                className="tree-action"
                title="Rename"
                onClick={() => startRename(node)}
              >
                ✎
              </button>
            </div>
          </div>
          {renderFolderChildren(node, depth)}
        </div>
      );
    }

    const fileNode = node as FileNode;
    return (
      <div
        key={fileNode.id}
        className={classNames('tree-item file', { editing: isEditing })}
        style={paddingStyle}
        role="button"
        tabIndex={0}
        onClick={() => handleFileOpen(fileNode.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleFileOpen(fileNode.id);
          }
        }}
      >
        {isEditing ? (
          <input
            autoFocus
            className="tree-input"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={handleInputKey}
          />
        ) : (
          <span className="tree-label" onDoubleClick={() => startRename(fileNode)}>
            {fileNode.name}
          </span>
        )}
        {!isEditing && (
          <span
            role="button"
            tabIndex={0}
            className="tree-action"
            onClick={(event) => {
              event.stopPropagation();
              startRename(fileNode);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                startRename(fileNode);
              }
            }}
            title="Rename"
          >
            ✎
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Files
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="tree-action"
            onClick={() => handleCreateFile(null)}
            title="Create file at root"
          >
            ＋F
          </button>
          <button
            type="button"
            className="tree-action"
            onClick={() => handleCreateFolder(null)}
            title="Create folder at root"
          >
            ＋D
          </button>
        </div>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        {tree.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};
