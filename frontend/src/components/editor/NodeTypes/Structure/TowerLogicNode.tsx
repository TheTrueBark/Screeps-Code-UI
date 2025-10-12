import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "structure.tower",
  type: "structure.tower",
  title: "Tower Logic",
  subtitle: "Structure",
  description:
    "Configure priorities for tower healing, attacking and repairing.",
  family: "structureLogic",
  category: "Structure Logic",
  defaultConfig: {
    priorities: ["heal", "attack", "repair"],
    healThreshold: 0.8,
    repairThreshold: 0.6,
  },
  configFields: [
    {
      type: "json",
      name: "priorities",
      label: "Priorities",
      helper: 'Array of priorities e.g. ["heal","attack","repair"].',
    },
    {
      type: "number",
      name: "healThreshold",
      label: "Heal threshold",
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      type: "number",
      name: "repairThreshold",
      label: "Repair threshold",
      min: 0,
      max: 1,
      step: 0.05,
    },
  ],
  dataInputs: [
    { name: "tower", label: "Tower", handleId: "input:tower", optional: true },
  ],
};

export const TowerLogicNode = createNodeComponent(baseDefinition);

export const towerLogicNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: TowerLogicNode,
};
