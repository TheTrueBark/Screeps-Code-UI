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
          {node.kind === "folder" ? (
            <svg
              className="tree-icon tree-icon-caret"
              viewBox="0 0 12 12"
              focusable="false"
            >
              {isCollapsed ? (
                <polyline
                  points="4 3 8 6 4 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <polyline
                  points="3 5 6 8 9 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          ) : (
            <svg
              className="tree-icon tree-icon-file"
              viewBox="0 0 12 12"
              focusable="false"
            >
              <circle cx="6" cy="6" r="2.5" />
            </svg>
          )}
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

  return (
    <div className="file-tree">
      <div className="file-tree-brand">
        <span className="file-tree-brand-title">{normalizedWorkspaceName}</span>
        <button
          type="button"
          className="tree-collapse"
          onClick={onCollapse}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <svg viewBox="0 0 12 12" focusable="false">
            <polyline
              points="7.5 3 4.5 6 7.5 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <label className="file-tree-search">
        <span className="file-tree-search-icon" aria-hidden>
          <svg viewBox="0 0 18 18" focusable="false">
            <circle
              cx="8"
              cy="8"
              r="4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="11.5"
              y1="11.5"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
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
