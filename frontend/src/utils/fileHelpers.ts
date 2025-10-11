export type BaseTreeNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
};

export type FileNode = BaseTreeNode & {
  type: 'file';
};

export type FolderNode = BaseTreeNode & {
  type: 'folder';
  children: TreeNode[];
};

export type TreeNode = FileNode | FolderNode;

/**
 * Returns a node by id by walking the nested tree. Useful for opening files
 * or updating metadata without mutating the existing array.
 */
export const findNodeById = (
  nodes: TreeNode[],
  id: string
): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.type === 'folder') {
      const match = findNodeById(node.children, id);
      if (match) {
        return match;
      }
    }
  }

  return undefined;
};

/**
 * Creates a new tree with the provided child appended to the parent folder.
 * Passing `null` as parent id will append to the root level.
 */
export const addNodeToTree = (
  nodes: TreeNode[],
  parentId: string | null,
  child: TreeNode
): TreeNode[] => {
  if (parentId === null) {
    return [...nodes, child];
  }

  return nodes.map((node) => {
    if (node.type !== 'folder') {
      return node;
    }

    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, child]
      } satisfies FolderNode;
    }

    return {
      ...node,
      children: addNodeToTree(node.children, parentId, child)
    } satisfies FolderNode;
  });
};

/**
 * Updates the name of an item in the tree without mutating the original
 * reference.
 */
export const renameNodeInTree = (
  nodes: TreeNode[],
  id: string,
  name: string
): TreeNode[] =>
  nodes.map((node) => {
    if (node.id === id) {
      return {
        ...node,
        name
      } as TreeNode;
    }

    if (node.type === 'folder') {
      return {
        ...node,
        children: renameNodeInTree(node.children, id, name)
      } satisfies FolderNode;
    }

    return node;
  });

const collectSiblingNames = (
  nodes: TreeNode[],
  parentId: string | null
): string[] => {
  if (parentId === null) {
    return nodes.map((node) => node.name.toLowerCase());
  }

  const parent = findNodeById(nodes, parentId);
  if (parent && parent.type === 'folder') {
    return parent.children.map((child) => child.name.toLowerCase());
  }

  return [];
};

/**
 * Ensures that a new file or folder name is unique for its parent scope by
 * appending an incrementing suffix when necessary.
 */
export const createUniqueName = (
  nodes: TreeNode[],
  parentId: string | null,
  baseName: string
): string => {
  const lowerBase = baseName.toLowerCase();
  const existing = collectSiblingNames(nodes, parentId);

  if (!existing.includes(lowerBase)) {
    return baseName;
  }

  let index = 2;
  while (existing.includes(`${lowerBase} ${index}`)) {
    index += 1;
  }

  return `${baseName} ${index}`;
};
