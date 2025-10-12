import type { NodeTypes } from "@xyflow/react";
import { getNodeMeta } from "../../data/nodeRegistry";
import type { NodeDefinition } from "./NodeTypes/types";
import { StartNode, startNodeDefinition } from "./NodeTypes/Flow/StartNode";
import { IfNode, ifNodeDefinition } from "./NodeTypes/Flow/IfNode";
import { SwitchNode, switchNodeDefinition } from "./NodeTypes/Flow/SwitchNode";
import { LoopNode, loopNodeDefinition } from "./NodeTypes/Flow/LoopNode";
import {
  TryCatchNode,
  tryCatchNodeDefinition,
} from "./NodeTypes/Flow/TryCatchNode";
import { ReturnNode, returnNodeDefinition } from "./NodeTypes/Flow/ReturnNode";
import {
  BreakContinueNode,
  breakContinueNodeDefinition,
} from "./NodeTypes/Flow/BreakContinueNode";
import {
  ScheduleNode,
  scheduleNodeDefinition,
} from "./NodeTypes/Flow/ScheduleNode";
import {
  SplitterNode,
  splitterNodeDefinition,
} from "./NodeTypes/Flow/SplitterNode";
import { MergerNode, mergerNodeDefinition } from "./NodeTypes/Flow/MergerNode";
import { FindNode, findNodeDefinition } from "./NodeTypes/Query/FindNode";
import {
  ResolveByIdNode,
  resolveByIdNodeDefinition,
} from "./NodeTypes/Query/ResolveByIdNode";
import {
  NeighborhoodNode,
  neighborhoodNodeDefinition,
} from "./NodeTypes/Query/NeighborhoodNode";
import {
  SortBestNode,
  sortBestNodeDefinition,
} from "./NodeTypes/Query/SortBestNode";
import { MoveNode, moveNodeDefinition } from "./NodeTypes/Creep/MoveNode";
import {
  HarvestNode,
  harvestNodeDefinition,
} from "./NodeTypes/Creep/HarvestNode";
import {
  TransferNode,
  transferNodeDefinition,
} from "./NodeTypes/Creep/TransferNode";
import {
  WithdrawNode,
  withdrawNodeDefinition,
} from "./NodeTypes/Creep/WithdrawNode";
import { BuildNode, buildNodeDefinition } from "./NodeTypes/Creep/BuildNode";
import { RepairNode, repairNodeDefinition } from "./NodeTypes/Creep/RepairNode";
import {
  UpgradeNode,
  upgradeNodeDefinition,
} from "./NodeTypes/Creep/UpgradeNode";
import { AttackNode, attackNodeDefinition } from "./NodeTypes/Creep/AttackNode";
import { HealNode, healNodeDefinition } from "./NodeTypes/Creep/HealNode";
import {
  SpawnCreepNode,
  spawnCreepNodeDefinition,
} from "./NodeTypes/Structure/SpawnCreepNode";
import {
  TowerLogicNode,
  towerLogicNodeDefinition,
} from "./NodeTypes/Structure/TowerLogicNode";
import {
  LinkSendNode,
  linkSendNodeDefinition,
} from "./NodeTypes/Structure/LinkSendNode";
import {
  TerminalMarketNode,
  terminalMarketNodeDefinition,
} from "./NodeTypes/Structure/TerminalMarketNode";
import {
  MemoryReadNode,
  memoryReadNodeDefinition,
} from "./NodeTypes/Memory/MemoryReadNode";
import {
  MemoryWriteNode,
  memoryWriteNodeDefinition,
} from "./NodeTypes/Memory/MemoryWriteNode";
import {
  MemoryDeleteNode,
  memoryDeleteNodeDefinition,
} from "./NodeTypes/Memory/MemoryDeleteNode";
import {
  DefineTaskNode,
  defineTaskNodeDefinition,
} from "./NodeTypes/Tasks/DefineTaskNode";
import {
  CallTaskNode,
  callTaskNodeDefinition,
} from "./NodeTypes/Tasks/CallTaskNode";

const withMetadata = (definition: NodeDefinition): NodeDefinition => {
  const meta = getNodeMeta(definition.kind);
  if (!meta) {
    return definition;
  }

  return {
    ...definition,
    title: meta.title,
    description: meta.docs.summary,
    family: meta.family,
    category: meta.category ?? definition.category ?? meta.family,
  };
};

export const NODE_DEFINITIONS: NodeDefinition[] = [
  startNodeDefinition,
  ifNodeDefinition,
  switchNodeDefinition,
  loopNodeDefinition,
  tryCatchNodeDefinition,
  returnNodeDefinition,
  breakContinueNodeDefinition,
  scheduleNodeDefinition,
  splitterNodeDefinition,
  mergerNodeDefinition,
  findNodeDefinition,
  resolveByIdNodeDefinition,
  neighborhoodNodeDefinition,
  sortBestNodeDefinition,
  moveNodeDefinition,
  harvestNodeDefinition,
  transferNodeDefinition,
  withdrawNodeDefinition,
  buildNodeDefinition,
  repairNodeDefinition,
  upgradeNodeDefinition,
  attackNodeDefinition,
  healNodeDefinition,
  spawnCreepNodeDefinition,
  towerLogicNodeDefinition,
  linkSendNodeDefinition,
  terminalMarketNodeDefinition,
  memoryReadNodeDefinition,
  memoryWriteNodeDefinition,
  memoryDeleteNodeDefinition,
  defineTaskNodeDefinition,
  callTaskNodeDefinition,
].map(withMetadata);

export const NODE_DEFINITION_MAP: Record<string, NodeDefinition> =
  Object.fromEntries(
    NODE_DEFINITIONS.map((definition) => [definition.kind, definition]),
  );

export const NODE_TYPE_MAP: NodeTypes = {
  [startNodeDefinition.type]: StartNode,
  [ifNodeDefinition.type]: IfNode,
  [switchNodeDefinition.type]: SwitchNode,
  [loopNodeDefinition.type]: LoopNode,
  [tryCatchNodeDefinition.type]: TryCatchNode,
  [returnNodeDefinition.type]: ReturnNode,
  [breakContinueNodeDefinition.type]: BreakContinueNode,
  [scheduleNodeDefinition.type]: ScheduleNode,
  [splitterNodeDefinition.type]: SplitterNode,
  [mergerNodeDefinition.type]: MergerNode,
  [findNodeDefinition.type]: FindNode,
  [resolveByIdNodeDefinition.type]: ResolveByIdNode,
  [neighborhoodNodeDefinition.type]: NeighborhoodNode,
  [sortBestNodeDefinition.type]: SortBestNode,
  [moveNodeDefinition.type]: MoveNode,
  [harvestNodeDefinition.type]: HarvestNode,
  [transferNodeDefinition.type]: TransferNode,
  [withdrawNodeDefinition.type]: WithdrawNode,
  [buildNodeDefinition.type]: BuildNode,
  [repairNodeDefinition.type]: RepairNode,
  [upgradeNodeDefinition.type]: UpgradeNode,
  [attackNodeDefinition.type]: AttackNode,
  [healNodeDefinition.type]: HealNode,
  [spawnCreepNodeDefinition.type]: SpawnCreepNode,
  [towerLogicNodeDefinition.type]: TowerLogicNode,
  [linkSendNodeDefinition.type]: LinkSendNode,
  [terminalMarketNodeDefinition.type]: TerminalMarketNode,
  [memoryReadNodeDefinition.type]: MemoryReadNode,
  [memoryWriteNodeDefinition.type]: MemoryWriteNode,
  [memoryDeleteNodeDefinition.type]: MemoryDeleteNode,
  [defineTaskNodeDefinition.type]: DefineTaskNode,
  [callTaskNodeDefinition.type]: CallTaskNode,
};
