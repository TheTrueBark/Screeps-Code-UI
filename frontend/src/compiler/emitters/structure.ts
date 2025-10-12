import type { NodeIR } from "@shared/types";
import type { EmitContext } from "./support";
import { toObjectLiteral } from "./support";

const formatBodyArray = (value: unknown): string => {
  if (!Array.isArray(value)) {
    return "[]";
  }
  return `[${value.map((part) => JSON.stringify(part)).join(", ")}]`;
};

export const emitSpawnCreep = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const spawnExpr = ctx.resolvePort(
    node.id,
    node.inputs.spawnRef,
    "creep.room.find(FIND_MY_SPAWNS)[0]",
  );
  const namePrefix =
    typeof node.config.namePrefix === "string"
      ? node.config.namePrefix
      : "worker";
  const memoryTemplate =
    typeof node.config.memoryTemplate === "object" &&
    node.config.memoryTemplate !== null
      ? (node.config.memoryTemplate as Record<string, unknown>)
      : {};
  if (
    typeof node.config.roleFile === "string" &&
    node.config.roleFile.length > 0
  ) {
    memoryTemplate.role = node.config.roleFile;
  }
  const strategy =
    typeof node.config.bodyStrategy === "string"
      ? node.config.bodyStrategy
      : "Fixed";
  const weights =
    typeof node.config.weights === "object" && node.config.weights !== null
      ? (node.config.weights as Record<string, number>)
      : {};
  const energyCap = Number(node.config.energyCap ?? 0);

  ctx.pushStatement("{");
  ctx.enterScope();
  ctx.pushStatement(
    `const spawn = ${spawnExpr} as StructureSpawn | undefined;`,
  );
  ctx.pushStatement("if (spawn) {");
  ctx.enterScope();
  ctx.pushStatement("const body = [] as BodyPartConstant[];");

  if (strategy === "Fixed") {
    ctx.pushStatement(
      `body.push(...(${formatBodyArray(node.config.fixedBody)} as BodyPartConstant[]));`,
    );
  } else if (strategy === "Weighted") {
    ctx.pushStatement(
      `const weightConfig = ${toObjectLiteral(weights)} as Record<string, number>;`,
    );
    ctx.pushStatement("const costs: Record<string, number> = {");
    ctx.enterScope();
    ctx.pushStatement(
      "MOVE: 50, WORK: 100, CARRY: 50, ATTACK: 80, RANGED_ATTACK: 150, HEAL: 250, TOUGH: 10, CLAIM: 600",
    );
    ctx.exitScope();
    ctx.pushStatement("};");
    const energyExpr =
      energyCap > 0 ? String(energyCap) : "spawn.room.energyCapacityAvailable";
    ctx.pushStatement(`let energy = ${energyExpr};`);
    ctx.pushStatement(
      'const entries = Object.entries(weightConfig).filter(([, value]) => typeof value === "number" && value > 0);',
    );
    ctx.pushStatement("while (energy > 0 && entries.length > 0) {");
    ctx.enterScope();
    ctx.pushStatement("let progressed = false;");
    ctx.pushStatement("for (const [part, weight] of entries) {");
    ctx.enterScope();
    ctx.pushStatement("const cost = costs[part] ?? 0;");
    ctx.pushStatement("if (cost <= 0 || energy < cost) { continue; }");
    ctx.pushStatement(
      "for (let i = 0; i < weight && energy >= cost; i += 1) {",
    );
    ctx.enterScope();
    ctx.pushStatement("body.push(part as BodyPartConstant);");
    ctx.pushStatement("energy -= cost;");
    ctx.pushStatement("progressed = true;");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.pushStatement("if (!progressed) {");
    ctx.enterScope();
    ctx.pushStatement("break;");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.exitScope();
    ctx.pushStatement("}");
    ctx.pushStatement(
      `if (body.length === 0) { body.push(...(${formatBodyArray(node.config.fixedBody)} as BodyPartConstant[])); }`,
    );
  } else {
    ctx.pushStatement("const presets: Record<number, BodyPartConstant[]> = {");
    ctx.enterScope();
    ctx.pushStatement("1: [WORK, CARRY, MOVE],");
    ctx.pushStatement("2: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],");
    ctx.pushStatement("3: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],");
    ctx.pushStatement(
      "4: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],",
    );
    ctx.pushStatement(
      "5: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],",
    );
    ctx.pushStatement(
      "6: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],",
    );
    ctx.pushStatement(
      "7: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],",
    );
    ctx.pushStatement(
      "8: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];",
    );
    ctx.exitScope();
    ctx.pushStatement("};");
    ctx.pushStatement("const rcl = spawn.room.controller?.level ?? 1;");
    ctx.pushStatement("body.push(...(presets[rcl] ?? presets[1]));");
  }

  ctx.pushStatement(`const name = \`${namePrefix}-\${Game.time}\`;`);
  ctx.pushStatement(
    `const memory = ${toObjectLiteral(memoryTemplate)} as CreepMemory;`,
  );
  ctx.pushStatement(
    "if (memory.role == null && memory.roleName) { memory.role = memory.roleName as string; }",
  );
  ctx.pushStatement("const result = spawn.spawnCreep(body, name, { memory });");
  ctx.pushStatement("void result;");
  ctx.exitScope();
  ctx.pushStatement("}");
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitTowerLogic = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const towerInput = ctx.resolvePort(
    node.id,
    node.inputs.tower,
    "creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })",
  );
  const priorities = Array.isArray(node.config.priorities)
    ? (node.config.priorities as string[])
    : ["heal", "attack", "repair"];
  const healThreshold = Number(node.config.healThreshold ?? 0.8);
  const repairThreshold = Number(node.config.repairThreshold ?? 0.6);

  ctx.pushStatement("{");
  ctx.enterScope();
  ctx.pushStatement(`const towerSource = ${towerInput};`);
  ctx.pushStatement(
    "const towers: StructureTower[] = Array.isArray(towerSource) ? (towerSource as StructureTower[]) : towerSource ? [towerSource as StructureTower] : [];",
  );
  ctx.pushStatement(`const order = ${JSON.stringify(priorities)};`);
  ctx.pushStatement("for (const tower of towers) {");
  ctx.enterScope();
  ctx.pushStatement("for (const priority of order) {");
  ctx.enterScope();
  ctx.pushStatement('if (priority === "heal") {');
  ctx.enterScope();
  ctx.pushStatement(
    `const injured = tower.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax * ${healThreshold} });`,
  );
  ctx.pushStatement("if (injured) { tower.heal(injured); break; }");
  ctx.exitScope();
  ctx.pushStatement('} else if (priority === "attack") {');
  ctx.enterScope();
  ctx.pushStatement(
    "const hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);",
  );
  ctx.pushStatement("if (hostile) { tower.attack(hostile); break; }");
  ctx.exitScope();
  ctx.pushStatement('} else if (priority === "repair") {');
  ctx.enterScope();
  ctx.pushStatement(
    `const target = tower.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.hits < s.hitsMax * ${repairThreshold} });`,
  );
  ctx.pushStatement("if (target) { tower.repair(target); break; }");
  ctx.exitScope();
  ctx.pushStatement("}");
  ctx.exitScope();
  ctx.pushStatement("}");
  ctx.exitScope();
  ctx.pushStatement("}");
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitLinkSend = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const from = ctx.resolvePort(node.id, node.inputs.from, "undefined");
  const to = ctx.resolvePort(node.id, node.inputs.to, "undefined");
  const amountExpr =
    node.config.amount !== null && node.config.amount !== undefined
      ? `${Number(node.config.amount)}`
      : "undefined";
  ctx.pushStatement(`if (${from} && ${to}) {`);
  ctx.enterScope();
  ctx.pushStatement(
    `const result = (${from} as StructureLink).transferEnergy(${to} as StructureLink, ${amountExpr});`,
  );
  ctx.pushStatement("void result;");
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitTerminalMarket = (
  node: NodeIR,
  ctx: EmitContext,
  emitNext: (nextId: string) => void,
) => {
  const terminalExpr = ctx.resolvePort(
    node.id,
    node.inputs.terminal,
    "creep.room.terminal",
  );
  const resource =
    typeof node.config.resource === "string"
      ? node.config.resource
      : "RESOURCE_ENERGY";
  const price = Number(node.config.price ?? 0.1);
  const amount = Number(node.config.amount ?? 100);
  const mode = typeof node.config.mode === "string" ? node.config.mode : "sell";

  ctx.pushStatement(
    `const terminal = ${terminalExpr} as StructureTerminal | undefined;`,
  );
  ctx.pushStatement("if (terminal) {");
  ctx.enterScope();
  ctx.pushStatement(`const roomName = terminal.room.name;`);
  if (mode === "buy") {
    ctx.pushStatement(
      `Game.market.createOrder({ type: ORDER_BUY, resourceType: ${resource} as ResourceConstant, price: ${price}, totalAmount: ${amount}, roomName });`,
    );
  } else if (mode === "deal") {
    ctx.pushStatement(
      "const orderId = (terminal as any).memory?.orderId as Id<Order> | undefined;",
    );
    ctx.pushStatement(
      `if (orderId) { Game.market.deal(orderId, ${amount}, roomName); } else { /* No order id configured */ }`,
    );
  } else {
    ctx.pushStatement(
      `Game.market.createOrder({ type: ORDER_SELL, resourceType: ${resource} as ResourceConstant, price: ${price}, totalAmount: ${amount}, roomName });`,
    );
  }
  ctx.exitScope();
  ctx.pushStatement("}");
  node.outputs.forEach((targetId) => emitNext(targetId));
};
