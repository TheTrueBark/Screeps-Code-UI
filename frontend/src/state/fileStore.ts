import { create } from 'zustand';
import type { GraphState } from '@shared/types';
import { findEntryById, listFileIds, type FileEntry } from '../utils/fileHelpers';

export const GRAPH_STATE_VERSION = 1;
const SAVE_DEBOUNCE_MS = 600;

const defaultViewport = { x: 0, y: 0, zoom: 1 } as const;

const storageIndexKey = (workspaceId: string) => `sv_ide:${workspaceId}:index`;
const storageFileKey = (workspaceId: string, fileId: string) => `sv_ide:${workspaceId}:file:${fileId}`;

const createEmptyGraphState = (): GraphState => ({
  version: GRAPH_STATE_VERSION,
  xyflow: {
    nodes: [],
    edges: [],
    viewport: { ...defaultViewport }
  },
  updatedAt: Date.now()
});

const normalizeGraphState = (graph: Partial<GraphState> | null | undefined): GraphState => {
  if (!graph) {
    return createEmptyGraphState();
  }

  const nodes = Array.isArray(graph.xyflow?.nodes) ? graph.xyflow?.nodes ?? [] : [];
  const edges = Array.isArray(graph.xyflow?.edges) ? graph.xyflow?.edges ?? [] : [];
  const viewport = graph.xyflow?.viewport ?? defaultViewport;

  return {
    version: typeof graph.version === 'number' ? graph.version : GRAPH_STATE_VERSION,
    xyflow: {
      nodes,
      edges,
      viewport: {
        x: typeof viewport?.x === 'number' ? viewport.x : defaultViewport.x,
        y: typeof viewport?.y === 'number' ? viewport.y : defaultViewport.y,
        zoom: typeof viewport?.zoom === 'number' ? viewport.zoom : defaultViewport.zoom
      }
    },
    updatedAt: typeof graph.updatedAt === 'number' ? graph.updatedAt : Date.now()
  } satisfies GraphState;
};

const timers = new Map<string, ReturnType<typeof setTimeout>>();

type SaveStatus = 'idle' | 'saving' | 'saved';

type FileSaveState = {
  status: SaveStatus;
  dirty: boolean;
  lastSavedAt?: number;
};

type OpenTab = {
  id: string;
  name: string;
};

interface FileStoreState {
  workspaceId: string;
  fileTree: FileEntry[];
  openTabs: OpenTab[];
  activeFileId: string | null;
  collapsedFolders: Record<string, boolean>;
  graphs: Record<string, GraphState>;
  saveStates: Record<string, FileSaveState>;
  graphSerializer: (() => GraphState | null) | null;
  sidebarCollapsed: boolean;
  initWorkspace: (workspaceId: string, tree: FileEntry[]) => void;
  hydrateFromStorage: () => void;
  serializeToStorage: () => void;
  ensureGraphForFile: (fileId: string) => void;
  openFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  toggleFolder: (folderId: string) => void;
  registerGraphSerializer: (serializer: (() => GraphState | null) | null) => void;
  saveGraphForFile: (fileId: string, graph: GraphState, options?: { immediate?: boolean }) => void;
  saveActiveGraph: (graph: GraphState, options?: { immediate?: boolean }) => void;
  getGraphState: (fileId: string) => GraphState | null;
  flushPendingSaves: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

const persistIndex = (workspaceId: string, fileIds: string[], lastOpenedFileId: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload = {
      version: 1,
      lastOpenedFileId,
      files: fileIds
    };
    window.localStorage.setItem(storageIndexKey(workspaceId), JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to persist workspace index', error);
  }
};

const persistGraph = (workspaceId: string, fileId: string, graph: GraphState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageFileKey(workspaceId, fileId), JSON.stringify(graph));
  } catch (error) {
    console.warn(`Failed to persist graph for ${fileId}`, error);
  }
};

const readIndex = (workspaceId: string): { lastOpenedFileId: string | null } | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(storageIndexKey(workspaceId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { lastOpenedFileId?: string | null };
    return {
      lastOpenedFileId: typeof parsed.lastOpenedFileId === 'string' ? parsed.lastOpenedFileId : null
    };
  } catch (error) {
    console.warn('Failed to parse workspace index', error);
    return null;
  }
};

const readGraph = (workspaceId: string, fileId: string): GraphState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(storageFileKey(workspaceId, fileId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GraphState>;
    return normalizeGraphState(parsed);
  } catch (error) {
    console.warn(`Failed to parse graph for ${fileId}`, error);
    return null;
  }
};

export const useFileStore = create<FileStoreState>((set, get) => ({
  workspaceId: '',
  fileTree: [],
  openTabs: [],
  activeFileId: null,
  collapsedFolders: {},
  graphs: {},
  saveStates: {},
  graphSerializer: null,
  sidebarCollapsed: false,
  initWorkspace: (workspaceId, tree) => {
    const fileIds = listFileIds(tree);
    const initialGraphs: Record<string, GraphState> = {};
    const initialSaveStates: Record<string, FileSaveState> = {};

    fileIds.forEach((fileId) => {
      initialGraphs[fileId] = createEmptyGraphState();
      initialSaveStates[fileId] = { status: 'saved', dirty: false, lastSavedAt: Date.now() };
    });

    set({
      workspaceId,
      fileTree: tree,
      graphs: initialGraphs,
      saveStates: initialSaveStates
    });

    get().hydrateFromStorage();
  },
  hydrateFromStorage: () => {
    const { workspaceId, fileTree } = get();
    if (!workspaceId || fileTree.length === 0) {
      return;
    }

    const fileIds = listFileIds(fileTree);
    const index = readIndex(workspaceId);
    const hydratedGraphs: Record<string, GraphState> = {};
    const hydratedSaves: Record<string, FileSaveState> = {};

    fileIds.forEach((fileId) => {
      const stored = readGraph(workspaceId, fileId);
      const graph = stored ?? createEmptyGraphState();
      hydratedGraphs[fileId] = graph;
      hydratedSaves[fileId] = {
        status: 'saved',
        dirty: false,
        lastSavedAt: graph.updatedAt
      };
    });

    const fallbackActive = fileIds[0] ?? null;
    const activeFileId = index?.lastOpenedFileId && fileIds.includes(index.lastOpenedFileId)
      ? index.lastOpenedFileId
      : fallbackActive;

    const openTabs = activeFileId
      ? [
          {
            id: activeFileId,
            name: findEntryById(fileTree, activeFileId)?.name ?? activeFileId
          }
        ]
      : [];

    set({
      graphs: hydratedGraphs,
      saveStates: hydratedSaves,
      activeFileId,
      openTabs
    });
  },
  serializeToStorage: () => {
    const { workspaceId, fileTree, graphs, activeFileId } = get();
    if (!workspaceId) {
      return;
    }

    const fileIds = listFileIds(fileTree);
    persistIndex(workspaceId, fileIds, activeFileId);

    fileIds.forEach((fileId) => {
      const graph = graphs[fileId] ?? createEmptyGraphState();
      persistGraph(workspaceId, fileId, graph);
    });
  },
  ensureGraphForFile: (fileId) => {
    const { graphs } = get();
    if (graphs[fileId]) {
      return;
    }

    set(({ graphs: current, saveStates }) => ({
      graphs: {
        ...current,
        [fileId]: createEmptyGraphState()
      },
      saveStates: {
        ...saveStates,
        [fileId]: { status: 'saved', dirty: false, lastSavedAt: Date.now() }
      }
    }));
  },
  openFile: (fileId) => {
    const { fileTree, openTabs, graphSerializer, activeFileId, workspaceId } = get();
    if (activeFileId === fileId) {
      return;
    }

    const entry = findEntryById(fileTree, fileId);
    if (!entry || entry.kind !== 'file') {
      return;
    }

    if (graphSerializer && activeFileId) {
      const snapshot = graphSerializer();
      if (snapshot) {
        get().saveGraphForFile(activeFileId, snapshot, { immediate: true });
      }
    }

    get().ensureGraphForFile(fileId);

    const nextTabs = openTabs.some((tab) => tab.id === fileId)
      ? openTabs
      : [...openTabs, { id: fileId, name: entry.name }];

    set({ openTabs: nextTabs, activeFileId: fileId });

    if (workspaceId) {
      const fileIds = listFileIds(fileTree);
      persistIndex(workspaceId, fileIds, fileId);
    }
  },
  closeTab: (fileId) => {
    const { openTabs, activeFileId, fileTree, workspaceId } = get();
    const nextTabs = openTabs.filter((tab) => tab.id !== fileId);

    let nextActive = activeFileId;
    if (activeFileId === fileId) {
      nextActive = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null;
    }

    set({ openTabs: nextTabs, activeFileId: nextActive });

    if (workspaceId) {
      const fileIds = listFileIds(fileTree);
      persistIndex(workspaceId, fileIds, nextActive);
    }
  },
  setActiveFile: (fileId) => {
    const { openTabs, activeFileId, graphSerializer, fileTree, workspaceId } = get();
    if (activeFileId === fileId || !openTabs.some((tab) => tab.id === fileId)) {
      return;
    }

    if (graphSerializer && activeFileId) {
      const snapshot = graphSerializer();
      if (snapshot) {
        get().saveGraphForFile(activeFileId, snapshot, { immediate: true });
      }
    }

    set({ activeFileId: fileId });

    if (workspaceId) {
      const fileIds = listFileIds(fileTree);
      persistIndex(workspaceId, fileIds, fileId);
    }
  },
  toggleFolder: (folderId) => {
    set(({ collapsedFolders }) => ({
      collapsedFolders: {
        ...collapsedFolders,
        [folderId]: !collapsedFolders[folderId]
      }
    }));
  },
  registerGraphSerializer: (serializer) => {
    set({ graphSerializer: serializer });
  },
  saveGraphForFile: (fileId, graph, options) => {
    const normalized = normalizeGraphState(graph);

    set(({ graphs, saveStates }) => ({
      graphs: {
        ...graphs,
        [fileId]: normalized
      },
      saveStates: {
        ...saveStates,
        [fileId]: {
          status: options?.immediate ? 'saved' : 'saving',
          dirty: !options?.immediate,
          lastSavedAt: options?.immediate ? normalized.updatedAt : saveStates[fileId]?.lastSavedAt
        }
      }
    }));

    const runCommit = () => {
      timers.delete(fileId);
      const { workspaceId, graphs, fileTree, activeFileId } = get();
      if (!workspaceId) {
        return;
      }

      const fileIds = listFileIds(fileTree);
      persistGraph(workspaceId, fileId, graphs[fileId] ?? createEmptyGraphState());
      persistIndex(workspaceId, fileIds, activeFileId);

      set(({ saveStates }) => ({
        saveStates: {
          ...saveStates,
          [fileId]: {
            status: 'saved',
            dirty: false,
            lastSavedAt: graphs[fileId]?.updatedAt ?? Date.now()
          }
        }
      }));
    };

    if (options?.immediate) {
      runCommit();
      return;
    }

    const existing = timers.get(fileId);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(runCommit, SAVE_DEBOUNCE_MS);
    timers.set(fileId, timer);
  },
  saveActiveGraph: (graph, options) => {
    const { activeFileId } = get();
    if (!activeFileId) {
      return;
    }

    get().saveGraphForFile(activeFileId, graph, options);
  },
  getGraphState: (fileId) => {
    const { graphs } = get();
    return graphs[fileId] ?? null;
  },
  flushPendingSaves: () => {
    Array.from(timers.keys()).forEach((fileId) => {
      const timer = timers.get(fileId);
      if (timer) {
        clearTimeout(timer);
        timers.delete(fileId);
      }

      get().saveGraphForFile(fileId, get().graphs[fileId] ?? createEmptyGraphState(), {
        immediate: true
      });
    });
  },
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebarCollapsed: () => {
    set(({ sidebarCollapsed }) => ({ sidebarCollapsed: !sidebarCollapsed }));
  }
}));

export type { FileEntry, FileSaveState, SaveStatus };
