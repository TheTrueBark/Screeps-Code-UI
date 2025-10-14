import { useCallback, useMemo, useState } from "react";
import { useFileStore } from "../../state/fileStore";
import { cn } from "../../utils/classNames";
import type { FileEntry } from "../../utils/fileHelpers";

type FileTreeProps = {
  onCollapse?: () => void;
};

const depthPadding = (depth: number) => ({ paddingLeft: `${depth * 1.2}rem` });

const countFiles = (entry: FileEntry): number => {
  if (entry.kind === "file") {
    return 1;
  }

  return (entry.children ?? []).reduce(
    (total, child) => total + countFiles(child),
    0,
  );
};

const highlightMatch = (label: string, query: string) => {
  if (!query) {
    return label;
  }

  const index = label.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return label;
  }

  const before = label.slice(0, index);
  const match = label.slice(index, index + query.length);
  const after = label.slice(index + query.length);

  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
};

const FileTreeNode = ({
  node,
  depth,
  query,
  forceExpand,
}: {
  node: FileEntry;
  depth: number;
  query: string;
  forceExpand: boolean;
}) => {
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

  const isCollapsed =
    node.kind === "folder" && !forceExpand && collapsedFolders[node.id];
  const isActive = node.kind === "file" && activeFileId === node.id;
  const label = node.name.replace(/\.ts$/i, "");
  const matchesQuery = query
    ? label.toLowerCase().includes(query.toLowerCase())
    : false;
  const fileCount = node.kind === "folder" ? countFiles(node) : 0;

  return (
    <div className="tree-group">
      <div
        className={cn("tree-item", node.kind === "file" ? "file" : "folder", {
          active: isActive,
          matched: matchesQuery,
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
        <span className="tree-lead" aria-hidden>
          {node.kind === "folder" ? (isCollapsed ? "▸" : "▾") : "•"}
        </span>
        <span className="tree-label">{highlightMatch(label, query)}</span>
        {node.kind === "folder" ? (
          <span className="tree-count" aria-label={`${fileCount} files`}>
            {fileCount}
          </span>
        ) : null}
      </div>
      {node.kind === "folder" && !isCollapsed && node.children
        ? node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              query={query}
              forceExpand={forceExpand}
            />
          ))
        : null}
    </div>
  );
};

export const FileTree = ({ onCollapse }: FileTreeProps) => {
  const fileTree = useFileStore((state) => state.fileTree);
  const workspaceId = useFileStore((state) => state.workspaceId);
  const [query, setQuery] = useState("");

  const normalizedWorkspaceName = useMemo(() => {
    if (!workspaceId) {
      return "Workspace";
    }

    const pretty = workspaceId
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return pretty.trim() || "Workspace";
  }, [workspaceId]);

  const filteredTree = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return fileTree;
    }

    const filterNode = (entry: FileEntry): FileEntry | null => {
      if (entry.kind === "file") {
        return entry.name.toLowerCase().includes(trimmed) ? entry : null;
      }

      const children = (entry.children ?? [])
        .map(filterNode)
        .filter((child): child is FileEntry => child !== null);

      if (entry.name.toLowerCase().includes(trimmed) || children.length > 0) {
        return { ...entry, children };
      }

      return null;
    };

    return fileTree
      .map(filterNode)
      .filter((entry): entry is FileEntry => entry !== null);
  }, [fileTree, query]);

  const outline = useMemo(
    () =>
      filteredTree.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          depth={0}
          query={query}
          forceExpand={Boolean(query.trim())}
        />
      )),
    [filteredTree, query],
  );

  const totalFiles = useMemo(
    () => fileTree.reduce((total, entry) => total + countFiles(entry), 0),
    [fileTree],
  );

  return (
    <div className="file-tree">
      <div className="file-tree-brand">
        <div className="file-tree-brand-main">
          <span className="file-tree-brand-symbol" aria-hidden>
            <span className="file-tree-brand-dot" />
            <span className="file-tree-brand-hash">#</span>
          </span>
          <div className="file-tree-brand-text">
            <span className="file-tree-brand-label">Workspace</span>
            <h2 className="file-tree-brand-title">{normalizedWorkspaceName}</h2>
            <p className="file-tree-brand-subtitle">
              {fileTree.length} Collections · {totalFiles} Files
            </p>
          </div>
        </div>
        <div className="file-tree-brand-actions">
          <span className="file-tree-brand-chevron" aria-hidden>
            ▾
          </span>
          <button
            type="button"
            className="tree-collapse"
            onClick={onCollapse}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            ⟨
          </button>
        </div>
      </div>
      <label className="file-tree-search">
        <span className="file-tree-search-icon" aria-hidden>
          🔍
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          type="search"
          aria-label="Search files"
        />
        {query ? (
          <button
            type="button"
            className="file-tree-search-clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </label>
      <div className="file-tree-body">{outline}</div>
      {filteredTree.length === 0 ? (
        <div className="file-tree-empty">No files found</div>
      ) : null}
    </div>
  );
};
