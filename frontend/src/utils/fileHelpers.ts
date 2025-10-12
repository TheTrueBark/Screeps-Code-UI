export type FileEntry = {
  id: string;
  kind: "file" | "folder";
  name: string;
  children?: FileEntry[];
};

export const findEntryById = (
  entries: FileEntry[],
  id: string,
): FileEntry | undefined => {
  for (const entry of entries) {
    if (entry.id === id) {
      return entry;
    }

    if (entry.kind === "folder" && entry.children) {
      const nested = findEntryById(entry.children, id);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
};

export const flattenFileEntries = (entries: FileEntry[]): FileEntry[] => {
  const result: FileEntry[] = [];

  const walk = (nodes: FileEntry[]) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.kind === "folder" && node.children) {
        walk(node.children);
      }
    });
  };

  walk(entries);
  return result;
};

export const listFileIds = (entries: FileEntry[]): string[] =>
  flattenFileEntries(entries)
    .filter((entry) => entry.kind === "file")
    .map((entry) => entry.id);
