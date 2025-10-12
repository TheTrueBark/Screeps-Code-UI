import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.build",
  type: "creep.build",
  title: "Build",
  subtitle: "Creep",
  description: "Construct a targeted construction site.",
  family: "creepActions",
  category: "Creep Actions",
  defaultConfig: {
    repairThreshold: 0.8,
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
      label: "Site",
      handleId: "input:target",
      optional: false,
    },
  ],
};

export const BuildNode = createNodeComponent(baseDefinition);

export const buildNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: BuildNode,
};
