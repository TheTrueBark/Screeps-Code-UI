import type { NodeIR } from "@shared/types";
import type { EmitContext, WarningMessage } from "./support";
import {
  emitBreak,
  emitContinue,
  emitIf,
  emitLoop,
  emitMerger,
  emitReturn,
  emitSchedule,
  emitSplitter,
  emitStart,
  emitSwitch,
  emitTry,
} from "./flow";
import {
  emitFind,
  emitNeighborhood,
  emitResolveById,
  emitSortBest,
} from "./query";
import {
  emitAttack,
  emitBuild,
  emitCallTask,
  emitHarvest,
  emitHeal,
  emitMove,
  emitRepair,
  emitTransfer,
  emitUpgrade,
  emitWithdraw,
} from "./creep";
import {
  emitLinkSend,
  emitSpawnCreep,
  emitTerminalMarket,
  emitTowerLogic,
} from "./structure";
import { emitMemoryDelete, emitMemoryRead, emitMemoryWrite } from "./memory";

interface EmitHelpers {
  emitBranch: (nodeIds: string[]) => void;
  emitNext: (nextId: string) => void;
}

type NodeEmitter = (
  node: NodeIR,
  ctx: EmitContext,
  helpers: EmitHelpers,
) => void;

const NODE_EMITTERS: Partial<Record<NodeIR["kind"], NodeEmitter>> = {
  "flow.start": (node, ctx, helpers) => emitStart(node, ctx, helpers.emitNext),
  "flow.if": (node, ctx, helpers) =>
    emitIf(node, ctx, helpers.emitBranch, helpers.emitNext),
  "flow.switch": (node, ctx, helpers) =>
    emitSwitch(node, ctx, helpers.emitBranch, helpers.emitNext),
  "flow.loop": (node, ctx, helpers) =>
    emitLoop(node, ctx, helpers.emitBranch, helpers.emitNext),
  "flow.try": (node, ctx, helpers) =>
    emitTry(node, ctx, helpers.emitBranch, helpers.emitNext),
  "flow.return": (node, ctx) => emitReturn(node, ctx),
  "flow.break": (node, ctx) => emitBreak(node, ctx),
  "flow.continue": (node, ctx) => emitContinue(node, ctx),
  "flow.schedule": (node, ctx, helpers) =>
    emitSchedule(node, ctx, helpers.emitBranch, helpers.emitNext),
  "flow.split": (node, _ctx, helpers) =>
    emitSplitter(node, helpers.emitBranch, helpers.emitNext),
  "flow.merge": (node, _ctx, helpers) => emitMerger(node, helpers.emitNext),
  "query.find": (node, ctx, helpers) => emitFind(node, ctx, helpers.emitNext),
  "query.resolveById": (node, ctx, helpers) =>
    emitResolveById(node, ctx, helpers.emitNext),
  "query.neighborhood": (node, ctx, helpers) =>
    emitNeighborhood(node, ctx, helpers.emitNext),
  "query.sortBest": (node, ctx, helpers) =>
    emitSortBest(node, ctx, helpers.emitNext),
  "creep.move": (node, ctx, helpers) => emitMove(node, ctx, helpers.emitNext),
  "creep.harvest": (node, ctx, helpers) =>
    emitHarvest(node, ctx, helpers.emitNext),
  "creep.transfer": (node, ctx, helpers) =>
    emitTransfer(node, ctx, helpers.emitNext),
  "creep.withdraw": (node, ctx, helpers) =>
    emitWithdraw(node, ctx, helpers.emitNext),
  "creep.build": (node, ctx, helpers) => emitBuild(node, ctx, helpers.emitNext),
  "creep.repair": (node, ctx, helpers) =>
    emitRepair(node, ctx, helpers.emitNext),
  "creep.upgrade": (node, ctx, helpers) =>
    emitUpgrade(node, ctx, helpers.emitNext),
  "creep.attack": (node, ctx, helpers) =>
    emitAttack(node, ctx, helpers.emitNext),
  "creep.heal": (node, ctx, helpers) => emitHeal(node, ctx, helpers.emitNext),
  "structure.spawn": (node, ctx, helpers) =>
    emitSpawnCreep(node, ctx, helpers.emitNext),
  "structure.tower": (node, ctx, helpers) =>
    emitTowerLogic(node, ctx, helpers.emitNext),
  "structure.linkSend": (node, ctx, helpers) =>
    emitLinkSend(node, ctx, helpers.emitNext),
  "structure.terminalMarket": (node, ctx, helpers) =>
    emitTerminalMarket(node, ctx, helpers.emitNext),
  "memory.read": (node, ctx, helpers) =>
    emitMemoryRead(node, ctx, helpers.emitNext),
  "memory.write": (node, ctx, helpers) =>
    emitMemoryWrite(node, ctx, helpers.emitNext),
  "memory.delete": (node, ctx, helpers) =>
    emitMemoryDelete(node, ctx, helpers.emitNext),
  "task.call": (node, ctx, helpers) =>
    emitCallTask(node, ctx, helpers.emitNext),
  "task.define": () => {},
};

export const emitNodeSequence = (
  nodeId: string,
  ctx: EmitContext,
  nodeMap: Map<string, NodeIR>,
  visited: Set<string>,
  warnings: WarningMessage[],
) => {
  if (visited.has(nodeId)) {
    return;
  }
  visited.add(nodeId);
  const node = nodeMap.get(nodeId);
  if (!node) {
    return;
  }

  const emitNext = (nextId: string) =>
    emitNodeSequence(nextId, ctx, nodeMap, visited, warnings);
  const emitBranch = (nodes: string[]) =>
    nodes.forEach((childId) =>
      emitNodeSequence(childId, ctx, nodeMap, visited, warnings),
    );

  const emitter = NODE_EMITTERS[node.kind];
  if (emitter) {
    emitter(node, ctx, { emitNext, emitBranch });
  } else {
    warnings.push({
      nodeId: node.id,
      message: `No emitter implemented for ${node.kind}.`,
    });
    node.outputs.forEach((target) => emitNext(target));
  }
};
