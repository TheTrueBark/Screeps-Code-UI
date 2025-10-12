import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.repair",
  type: "creep.repair",
  title: "Repair",
  subtitle: "Creep",
  description: "Repair a damaged structure down to a configurable threshold.",
  family: "creepActions",
  category: "Creep Actions",
  defaultConfig: {
    repairThreshold: 0.5,
  },
  configFields: [
    {
      type: "number",
      name: "repairThreshold",
      label: "Repair threshold %",
      min: 0,
      max: 1,
      step: 0.05,
    },
  ],
  dataInputs: [
    {
      name: "creepRef",
      label: "Creep",
      handleId: "input:creep",
      optional: true,
    },
    {
      name: "target",
      label: "Structure",
      handleId: "input:target",
      optional: false,
    },
  ],
};

export const RepairNode = createNodeComponent(baseDefinition);

export const repairNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: RepairNode,
};
