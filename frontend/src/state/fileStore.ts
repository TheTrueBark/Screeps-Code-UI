import { nanoid } from 'nanoid';
import { create } from 'zustand';
import {
  addNodeToTree,
  createUniqueName,
  findNodeById,
  renameNodeInTree,
  type FileNode,
  type FolderNode,
  type TreeNode
} from '../utils/fileHelpers';

type OpenTab = {
  id: string;
  name: string;
};

interface FileStoreState {
  tree: TreeNode[];
  openTabs: OpenTab[];
  activeFileId: string | null;
  collapsedFolders: Record<string, boolean>;
  openFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  createFile: (parentId: string | null) => string;
  createFolder: (parentId: string | null) => string;
  renameItem: (id: string, name: string) => void;
  toggleFolder: (folderId: string) => void;
  getFileById: (id: string) => FileNode | undefined;
}

const initialTree: TreeNode[] = [
  {
    id: 'roles',
    name: 'roles',
    type: 'folder',
    children: [
      {
        id: 'roles-harvester',
        name: 'harvester.ts',
        type: 'file'
      },
      {
        id: 'roles-builder',
        name: 'builder.ts',
        type: 'file'
      }
    ]
  } satisfies FolderNode,
  {
    id: 'utils',
    name: 'utils',
    type: 'folder',
    children: [
      {
        id: 'utils-logger',
        name: 'logger.ts',
        type: 'file'
      }
    ]
  } satisfies FolderNode
];

export const useFileStore = create<FileStoreState>((set, get) => ({
  tree: initialTree,
  openTabs: [],
  activeFileId: null,
  collapsedFolders: {},
  openFile: (fileId) => {
    const { tree, openTabs } = get();
    const node = findNodeById(tree, fileId);
    if (!node || node.type !== 'file') {
      return;
    }

    const alreadyOpen = openTabs.some((tab) => tab.id === fileId);
    const nextTabs = alreadyOpen
      ? openTabs
      : [...openTabs, { id: fileId, name: node.name }];

    set({ openTabs: nextTabs, activeFileId: fileId });
  },
  closeTab: (fileId) => {
    const { openTabs, activeFileId } = get();
    const nextTabs = openTabs.filter((tab) => tab.id !== fileId);
    const isActive = activeFileId === fileId;

    const lastTab = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : undefined;

    set({
      openTabs: nextTabs,
      activeFileId: isActive ? lastTab?.id ?? null : activeFileId
    });
  },
  setActiveFile: (fileId) => {
    const { openTabs } = get();
    if (!openTabs.some((tab) => tab.id === fileId)) {
      return;
    }

    set({ activeFileId: fileId });
  },
  createFile: (parentId) => {
    const { tree } = get();
    const name = `${createUniqueName(tree, parentId, 'New File')}.ts`;
    const id = nanoid();
    const file: FileNode = {
      id,
      name,
      type: 'file'
    };

    set({
      tree: addNodeToTree(tree, parentId, file)
    });

    return id;
  },
  createFolder: (parentId) => {
    const { tree } = get();
    const name = createUniqueName(tree, parentId, 'New Folder');
    const id = nanoid();
    const folder: FolderNode = {
      id,
      name,
      type: 'folder',
      children: []
    };

    set({
      tree: addNodeToTree(tree, parentId, folder)
    });

    return id;
  },
  renameItem: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const { tree, openTabs } = get();
    const renamedTree = renameNodeInTree(tree, id, trimmed);
    const updatedTabs = openTabs.map((tab) =>
      tab.id === id
        ? {
            ...tab,
            name: trimmed
          }
        : tab
    );

    set({ tree: renamedTree, openTabs: updatedTabs });
  },
  toggleFolder: (folderId) => {
    const { collapsedFolders } = get();
    set({
      collapsedFolders: {
        ...collapsedFolders,
        [folderId]: !collapsedFolders[folderId]
      }
    });
  },
  getFileById: (id) => {
    const { tree } = get();
    const node = findNodeById(tree, id);
    if (node && node.type === 'file') {
      return node;
    }

    return undefined;
  }
}));

export type { FileNode, FolderNode, TreeNode };
