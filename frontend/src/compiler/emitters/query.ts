import type { NodeIR } from "@shared/types";
import type { EmitContext } from "./support";

const accessor = (base: string, path: unknown): string => {
  if (typeof path !== "string" || path.trim().length === 0) {
    return base;
  }
  return path
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((acc, segment) => `${acc}?.${segment}`, base);
};

const buildFilterPredicate = (filters: unknown): string => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return "true";
  }

  const conditions = filters
    .map((filter) => {
      if (!filter || typeof filter !== "object") {
        return null;
      }
      const { field, op, value } = filter as {
        field?: string;
        op?: string;
        value?: unknown;
      };
      const left = accessor("candidate", field ?? "");
      const operator =
        typeof op === "string" && op.trim().length > 0 ? op : "===";
      const right =
        typeof value === "string" &&
        !value.trim().startsWith("Game") &&
        !value.trim().startsWith("creep")
          ? JSON.stringify(value)
          : JSON.stringify(value ?? "")
              .replace(/^"|"$/g, "")
              .replace(/\\"/g, '"');
      if (operator === "includes") {
        return `${left}?.includes(${right})`;
      }
      return `${left} ${operator} ${right}`;
    })
    .filter((entry): entry is string => Boolean(entry));

  if (conditions.length === 0) {
    return "true";
  }
  return conditions.join(" && ");
};

export const emitFind = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  let roomExpr = "creep.room";
  if (node.config.roomScope === "name") {
    const configured =
      typeof node.config.roomName === "string" &&
      node.config.roomName.trim().length > 0
        ? JSON.stringify(node.config.roomName.trim())
        : "creep.room.name";
    roomExpr = `Game.rooms[${configured}] ?? creep.room`;
  }

  const findConstant =
    typeof node.config.findConstant === "string"
      ? node.config.findConstant
      : "FIND_SOURCES";
  const sourceVar = ctx.newTemp("found");
  ctx.pushStatement(
    `const ${sourceVar} = (${roomExpr})?.find(${findConstant}) ?? [];`,
  );

  const filters = buildFilterPredicate(node.config.filters);
  const filteredVar = ctx.newTemp("filtered");
  ctx.pushStatement(
    `const ${filteredVar} = ${sourceVar}.filter((candidate) => ${filters});`,
  );

  const limit = Number(node.config.limit ?? 0);
  const limitedVar = ctx.newTemp("limited");
  if (limit > 0) {
    ctx.pushStatement(
      `const ${limitedVar} = ${filteredVar}.slice(0, ${limit});`,
    );
  } else {
    ctx.pushStatement(`const ${limitedVar} = ${filteredVar};`);
  }

  if (node.config.mode === "all") {
    ctx.setValue(node.id, limitedVar);
  } else {
    const firstVar = ctx.newTemp("first");
    ctx.pushStatement(`const ${firstVar} = ${limitedVar}[0] ?? null;`);
    ctx.setValue(node.id, firstVar);
  }

  node.outputs.forEach((target) => emitNext(target));
};

export const emitResolveById = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const idExpr = ctx.resolvePort(
    node.id,
    node.inputs.id,
    node.config.id ?? "undefined",
  );
  const varName = ctx.newTemp("resolved");
  ctx.pushStatement(
    `const ${varName} = Game.getObjectById(${idExpr} as Id<any>);`,
  );
  ctx.setValue(node.id, varName);
  node.outputs.forEach((target) => emitNext(target));
};

export const emitNeighborhood = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const radius = Number(node.config.radius ?? 0) || 0;
  const lookType =
    typeof node.config.type === "string" ? node.config.type : "LOOK_TERRAIN";
  if (node.config.mode === "lookForAtArea") {
    const varName = ctx.newTemp("area");
    ctx.pushStatement(
      `const ${varName} = creep.room.lookForAtArea(${lookType}, creep.pos.y - ${radius}, creep.pos.x - ${radius}, creep.pos.y + ${radius}, creep.pos.x + ${radius}, true);`,
    );
    ctx.setValue(node.id, varName);
  } else {
    const rawVar = ctx.newTemp("look");
    ctx.pushStatement(`const ${rawVar} = creep.room.lookAt(creep.pos);`);
    const filteredVar = ctx.newTemp("filteredLook");
    ctx.pushStatement(
      `const ${filteredVar} = ${rawVar}.filter((entry) => entry.type === ${lookType});`,
    );
    ctx.setValue(node.id, filteredVar);
  }
  node.outputs.forEach((target) => emitNext(target));
};

export const emitSortBest = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const listExpr = ctx.resolvePort(node.id, node.inputs.list, "[]");
  const listVar = ctx.newTemp("candidates");
  ctx.pushStatement(`const ${listVar} = (${listExpr}) ?? [];`);
  const strategy =
    typeof node.config.strategy === "string"
      ? node.config.strategy
      : "closestByPath";
  const resultVar = ctx.newTemp("best");

  if (strategy === "closestByRange") {
    ctx.pushStatement(
      `const ${resultVar} = creep.pos.findClosestByRange(${listVar} as any);`,
    );
  } else if (strategy === "closestByPath") {
    ctx.pushStatement(
      `const ${resultVar} = creep.pos.findClosestByPath(${listVar} as any);`,
    );
  } else {
    const comparison = strategy === "min" ? "<" : ">";
    const accessorExpr = accessor("item", node.config.key);
    const bestAccessor = accessor("best", node.config.key);
    ctx.pushStatement(
      `const ${resultVar} = ${listVar}.reduce((best, item) => {`,
    );
    ctx.enterScope();
    ctx.pushStatement("if (!item) {");
    ctx.enterScope();
    ctx.pushStatement("return best;");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.pushStatement("if (best === null) {");
    ctx.enterScope();
    ctx.pushStatement("return item;");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.pushStatement(`const current = ${accessorExpr};`);
    ctx.pushStatement(`const bestValue = ${bestAccessor};`);
    ctx.pushStatement(
      `if (${comparison === "<" ? "current < bestValue" : "current > bestValue"}) {`,
    );
    ctx.enterScope();
    ctx.pushStatement("return item;");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.pushStatement("return best;");
    ctx.exitScope();
    ctx.pushStatement(`}, null as any);`);
  }

  ctx.setValue(node.id, resultVar);
  node.outputs.forEach((target) => emitNext(target));
};
