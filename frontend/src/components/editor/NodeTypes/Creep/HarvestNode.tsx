import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.harvest",
  type: "creep.harvest",
  title: "Harvest",
  subtitle: "Creep",
  description: "Harvest energy or minerals from a source target.",
  family: "creep",
  category: "Creep Actions",
  defaultConfig: {
    fallback: "moveTo",
  },
  configFields: [
    {
      type: "select",
      name: "fallback",
      label: "Fallback",
      options: [
        { label: "Move closer", value: "moveTo" },
        { label: "None", value: "none" },
      ],
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
      label: "Source",
      handleId: "input:target",
      optional: false,
    },
  ],
};

export const HarvestNode = createNodeComponent(baseDefinition);

export const harvestNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: HarvestNode,
};
