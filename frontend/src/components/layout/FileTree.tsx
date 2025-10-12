import { useCallback, useMemo } from "react";
import { useFileStore } from "../../state/fileStore";
import { cn } from "../../utils/classNames";
import type { FileEntry } from "../../utils/fileHelpers";

type FileTreeProps = {
  onCollapse?: () => void;
};

const depthPadding = (depth: number) => ({ paddingLeft: `${depth * 1.2}rem` });

const FileTreeNode = ({ node, depth }: { node: FileEntry; depth: number }) => {
  const collapsedFolders = useFileStore((state) => state.collapsedFolders);
  const toggleFolder = useFileStore((state) => state.toggleFolder);
  const openFile = useFileStore((state) => state.openFile);
  const activeFileId = useFileStore((state) => state.activeFileId);

  const handleSelect = useCallback(() => {
    if (node.kind === "file") {
      openFile(node.id);
    } else {
      toggleFolder(node.id);
    }
  }, [node, openFile, toggleFolder]);

  const isCollapsed = node.kind === "folder" && collapsedFolders[node.id];
  const isActive = node.kind === "file" && activeFileId === node.id;

  return (
    <div className="tree-group">
      <div
        className={cn("tree-item", node.kind === "file" ? "file" : "folder", {
          active: isActive,
        })}
        style={depthPadding(depth)}
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
          }
        }}
      >
        {node.kind === "folder" ? (
          <span className="tree-toggle" aria-hidden>
            {isCollapsed ? "▸" : "▾"}
          </span>
        ) : (
          <span className="tree-bullet" aria-hidden>
            {isActive ? "●" : "•"}
          </span>
        )}
        <span className="tree-label">{node.name.replace(/\.ts$/i, "")}</span>
      </div>
      {node.kind === "folder" && !isCollapsed && node.children
        ? node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))
        : null}
    </div>
  );
};

export const FileTree = ({ onCollapse }: FileTreeProps) => {
  const fileTree = useFileStore((state) => state.fileTree);

  const outline = useMemo(
    () =>
      fileTree.map((node) => (
        <FileTreeNode key={node.id} node={node} depth={0} />
      )),
    [fileTree],
  );

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <div>
          <p className="file-tree-subheading">Workspace</p>
          <h2 className="file-tree-title">Process Scripts</h2>
        </div>
        <div className="file-tree-actions">
          <button
            type="button"
            className="tree-collapse"
            onClick={onCollapse}
            title="Collapse sidebar"
          >
            ◂
          </button>
        </div>
      </div>
      <div className="file-tree-body">{outline}</div>
    </div>
  );
};
