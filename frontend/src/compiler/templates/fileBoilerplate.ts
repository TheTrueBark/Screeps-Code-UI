export const wrapRoleFile = (
  importLines: string[],
  bodyStatements: string[],
  taskBlocks: string[],
): string => {
  const lines: string[] = [];
  lines.push("/* eslint-disable */");
  if (importLines.length > 0) {
    lines.push("");
    lines.push(...importLines);
  }
  lines.push("");
  lines.push("export function run(creep: Creep) {");
  if (bodyStatements.length === 0) {
    lines.push("  // No logic yet.");
  } else {
    lines.push(...bodyStatements);
  }
  lines.push("}");
  if (taskBlocks.length > 0) {
    lines.push("");
    lines.push(...taskBlocks);
  }
  return lines.join("\n");
};
