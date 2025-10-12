import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent
} from 'react';
import {
  useFileStore,
  type FileNode,
  type FolderNode,
  type TreeNode
} from '../../state/fileStore';
import { useNodeStore } from '../../state/nodeStore';
import { cn } from '../../utils/classNames';
import { findNodeById } from '../../utils/fileHelpers';

type FileTreeProps = {
  onCollapse?: () => void;
};

const depthPadding = (depth: number) => ({ paddingLeft: `${depth * 1.25}rem` });

export const FileTree = ({ onCollapse }: FileTreeProps) => {
  const tree = useFileStore((state) => state.tree);
  const collapsedFolders = useFileStore((state) => state.collapsedFolders);
  const openFile = useFileStore((state) => state.openFile);
  const createFile = useFileStore((state) => state.createFile);
  const createFolder = useFileStore((state) => state.createFolder);
  const renameItem = useFileStore((state) => state.renameItem);
  const toggleFolder = useFileStore((state) => state.toggleFolder);
  const getFileById = useFileStore((state) => state.getFileById);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const initializeGraph = useNodeStore((state) => state.initializeGraphForFile);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const closeMenu = useCallback(() => setMenuFor(null), []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('.tree-menu')) {
        closeMenu();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [closeMenu]);

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

  const formattedName = useCallback((name: string) => name.replace(/\.ts$/i, ''), []);

  const toggleMenu = useCallback((event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    setMenuFor((prev) => (prev === id ? null : id));
  }, []);

  const renderNode = useCallback(
    (node: TreeNode, depth: number): JSX.Element => {
      const isEditing = editingId === node.id;
      const style = depthPadding(depth);

      if (node.type === 'folder') {
        const collapsed = collapsedFolders[node.id];
        return (
          <div key={node.id} className="tree-group">
            <div className="tree-item" style={style}>
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
                  {formattedName(node.name)}
                </span>
              )}
              <div className="tree-menu">
                <button
                  type="button"
                  className={cn('tree-menu-trigger', { active: menuFor === node.id })}
                  aria-haspopup="true"
                  aria-expanded={menuFor === node.id}
                  onClick={(event) => toggleMenu(event, node.id)}
                >
                  ⋯
                </button>
                {menuFor === node.id && (
                  <div className="tree-menu-popover" role="menu">
                    <button
                      type="button"
                      className="tree-menu-item"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeMenu();
                        handleCreateFile(node.id);
                      }}
                    >
                      New file
                    </button>
                    <button
                      type="button"
                      className="tree-menu-item"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeMenu();
                        handleCreateFolder(node.id);
                      }}
                    >
                      New folder
                    </button>
                    <button
                      type="button"
                      className="tree-menu-item"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeMenu();
                        startRename(node);
                      }}
                    >
                      Rename
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!collapsed
              ? node.children.map((child) => renderNode(child, depth + 1))
              : null}
          </div>
        );
      }

      const fileNode = node as FileNode;
      const isActive = activeFileId === fileNode.id;

      return (
        <div
          key={fileNode.id}
          className={cn('tree-item file', { editing: isEditing, active: isActive })}
          style={style}
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
              {formattedName(fileNode.name)}
            </span>
          )}
          {!isEditing && (
            <div className="tree-menu">
              <button
                type="button"
                className={cn('tree-menu-trigger', { active: menuFor === fileNode.id })}
                aria-haspopup="true"
                aria-expanded={menuFor === fileNode.id}
                onClick={(event) => toggleMenu(event, fileNode.id)}
              >
                ⋯
              </button>
              {menuFor === fileNode.id && (
                <div className="tree-menu-popover" role="menu">
                  <button
                    type="button"
                    className="tree-menu-item"
                    onClick={(event) => {
                      event.stopPropagation();
                      closeMenu();
                      startRename(fileNode);
                    }}
                  >
                    Rename
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      activeFileId,
      closeMenu,
      collapsedFolders,
      commitRename,
      draftName,
      editingId,
      formattedName,
      handleCreateFile,
      handleCreateFolder,
      handleFileOpen,
      handleInputKey,
      menuFor,
      startRename,
      toggleFolder,
      toggleMenu
    ]
  );

  const outline = useMemo(() => tree.map((node) => renderNode(node, 0)), [renderNode, tree]);

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <div>
          <p className="file-tree-subheading">Workspace</p>
          <h2 className="file-tree-title">Process Scripts</h2>
        </div>
        <div className="file-tree-actions">
          <div className="tree-menu">
            <button
              type="button"
              className={cn('tree-menu-trigger', { active: menuFor === 'root-menu' })}
              aria-haspopup="true"
              aria-expanded={menuFor === 'root-menu'}
              onClick={(event) => toggleMenu(event, 'root-menu')}
            >
              ⋯
            </button>
            {menuFor === 'root-menu' && (
              <div className="tree-menu-popover" role="menu">
                <button
                  type="button"
                  className="tree-menu-item"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeMenu();
                    handleCreateFile(null);
                  }}
                >
                  New file
                </button>
                <button
                  type="button"
                  className="tree-menu-item"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeMenu();
                    handleCreateFolder(null);
                  }}
                >
                  New folder
                </button>
              </div>
            )}
          </div>
          <button type="button" className="tree-collapse" onClick={onCollapse} title="Collapse sidebar">
            ◂
          </button>
        </div>
      </div>
      <div className="file-tree-body">{outline}</div>
    </div>
  );
};
