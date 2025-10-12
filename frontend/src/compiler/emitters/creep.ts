import type { NodeIR } from "@shared/types";
import type { EmitContext } from "./support";
import { toObjectLiteral } from "./support";

const resolveCreep = (node: NodeIR, ctx: EmitContext) =>
  ctx.resolvePort(node.id, node.inputs.creepRef, "creep");

const ensureMoveFallback = (
  ctx: EmitContext,
  resultVar: string,
  creepExpr: string,
  targetExpr: string,
) => {
  ctx.pushStatement(`if (${resultVar} === ERR_NOT_IN_RANGE) {`);
  ctx.enterScope();
  ctx.pushStatement(`${creepExpr}.moveTo(${targetExpr});`);
  ctx.exitScope();
  ctx.pushStatement("}");
};

export const emitMove = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const targetExpr = ctx.resolvePort(
    node.id,
    node.inputs.targetPos,
    "creep.pos",
  );
  const moveImport = ctx.requireImport("move", "@/modules/movement");
  const options = toObjectLiteral({
    adapter:
      typeof node.config.adapter === "string"
        ? node.config.adapter
        : "Traveler",
    range: Number(node.config.range ?? 1),
    reusePath:
      node.config.reusePath !== undefined
        ? Number(node.config.reusePath)
        : undefined,
    flee: node.config.flee === true,
    avoidHostiles: node.config.avoidHostiles === true,
  });
  ctx.pushStatement(`${moveImport}(${creepExpr}, ${targetExpr}, ${options});`);
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitHarvest = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  const resultVar = ctx.newTemp("harvestResult");
  ctx.pushStatement(`const ${resultVar} = ${creepExpr}.harvest(${target});`);
  if (node.config.fallback === "moveTo") {
    ensureMoveFallback(ctx, resultVar, creepExpr, target);
  }
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitTransfer = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  const resource =
    typeof node.config.resource === "string"
      ? node.config.resource
      : "RESOURCE_ENERGY";
  const amount =
    node.config.amount !== null && node.config.amount !== undefined
      ? `, ${Number(node.config.amount)}`
      : "";
  const resultVar = ctx.newTemp("transferResult");
  ctx.pushStatement(
    `const ${resultVar} = ${creepExpr}.transfer(${target}, ${resource}${amount});`,
  );
  if (node.config.fallback === "moveTo") {
    ensureMoveFallback(ctx, resultVar, creepExpr, target);
  } else if (node.config.fallback === "drop") {
    ctx.pushStatement(`if (${resultVar} === ERR_FULL) {`);
    ctx.enterScope();
    ctx.pushStatement(`${creepExpr}.drop(${resource}${amount});`);
    ctx.exitScope();
    ctx.pushStatement("}");
  }
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitWithdraw = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  const resource =
    typeof node.config.resource === "string"
      ? node.config.resource
      : "RESOURCE_ENERGY";
  const amount =
    node.config.amount !== null && node.config.amount !== undefined
      ? `, ${Number(node.config.amount)}`
      : "";
  const resultVar = ctx.newTemp("withdrawResult");
  ctx.pushStatement(
    `const ${resultVar} = ${creepExpr}.withdraw(${target}, ${resource}${amount});`,
  );
  ensureMoveFallback(ctx, resultVar, creepExpr, target);
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitBuild = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  const resultVar = ctx.newTemp("buildResult");
  ctx.pushStatement(`const ${resultVar} = ${creepExpr}.build(${target});`);
  ctx.pushStatement(`if (${resultVar} === ERR_NOT_IN_RANGE) {`);
  ctx.enterScope();
  ctx.pushStatement(`${creepExpr}.moveTo(${target});`);
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitRepair = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  const threshold = Number(node.config.repairThreshold ?? 0.5);
  ctx.pushStatement(
    `if (${target} && ${target}.hits < ${target}.hitsMax * ${threshold}) {`,
  );
  ctx.enterScope();
  ctx.pushStatement(`const repairResult = ${creepExpr}.repair(${target});`);
  ensureMoveFallback(ctx, "repairResult", creepExpr, target);
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitUpgrade = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const controller = ctx.resolvePort(
    node.id,
    node.inputs.target,
    "creep.room.controller",
  );
  ctx.pushStatement(`if (${controller}) {`);
  ctx.enterScope();
  ctx.pushStatement(
    `const upgradeResult = ${creepExpr}.upgradeController(${controller});`,
  );
  ctx.pushStatement("void upgradeResult;");
  if (node.config.boost) {
    ctx.pushStatement("// TODO: handle boost usage for upgrading.");
  }
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitAttack = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  if (node.config.style === "ranged") {
    ctx.pushStatement(`${creepExpr}.rangedAttack(${target});`);
  } else {
    ctx.pushStatement(`${creepExpr}.attack(${target});`);
  }
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitHeal = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const creepExpr = resolveCreep(node, ctx);
  const target = ctx.resolvePort(node.id, node.inputs.target, "undefined");
  if (node.config.style === "ranged") {
    ctx.pushStatement(`${creepExpr}.rangedHeal(${target});`);
  } else {
    ctx.pushStatement(`${creepExpr}.heal(${target});`);
  }
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitCallTask = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const taskName =
    typeof node.config.taskName === "string" ? node.config.taskName : "unnamed";
  const identifier = `task_${taskName.replace(/[^a-zA-Z0-9_]/g, "_")}`;
  const argsExpr = ctx.resolvePort(
    node.id,
    node.inputs.args,
    node.config.args ?? {},
  );
  ctx.pushStatement(`${identifier}(${argsExpr});`);
  node.outputs.forEach((targetId) => emitNext(targetId));
};
