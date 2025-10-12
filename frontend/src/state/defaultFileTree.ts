import type { FileEntry } from '../utils/fileHelpers';

export const DEFAULT_WORKSPACE_ID = 'screeps-dev';

export const DEFAULT_FILE_TREE: FileEntry[] = [
  {
    id: 'roles',
    kind: 'folder',
    name: 'roles',
    children: [
      { id: 'roles/harvester.ts', kind: 'file', name: 'harvester.ts' },
      { id: 'roles/hauler.ts', kind: 'file', name: 'hauler.ts' },
      { id: 'roles/upgrader.ts', kind: 'file', name: 'upgrader.ts' }
    ]
  },
  {
    id: 'tasks',
    kind: 'folder',
    name: 'tasks',
    children: [
      { id: 'tasks/refill.ts', kind: 'file', name: 'refill.ts' },
      { id: 'tasks/build.ts', kind: 'file', name: 'build.ts' }
    ]
  },
  {
    id: 'utils',
    kind: 'folder',
    name: 'utils',
    children: [
      { id: 'utils/logger.ts', kind: 'file', name: 'logger.ts' },
      { id: 'utils/navigation.ts', kind: 'file', name: 'navigation.ts' }
    ]
  }
];
