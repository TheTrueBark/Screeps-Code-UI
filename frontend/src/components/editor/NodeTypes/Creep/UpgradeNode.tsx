import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.upgrade",
  type: "creep.upgrade",
  title: "Upgrade Controller",
  subtitle: "Creep",
  description: "Upgrade the room controller with available energy.",
  family: "creepActions",
  category: "Creep Actions",
  defaultConfig: {
    boost: false,
  },
  configFields: [
    { type: "checkbox", name: "boost", label: "Use work boosts if available" },
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
      label: "Controller",
      handleId: "input:target",
      optional: true,
    },
  ],
};

export const UpgradeNode = createNodeComponent(baseDefinition);

export const upgradeNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: UpgradeNode,
};
