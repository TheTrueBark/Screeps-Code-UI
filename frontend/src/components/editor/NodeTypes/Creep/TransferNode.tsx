import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { RESOURCES } from "../../../../shared/constants";

const resourceOptions = RESOURCES.map((resource) => ({
  label: resource.replace("RESOURCE_", ""),
  value: resource,
}));

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.transfer",
  type: "creep.transfer",
  title: "Transfer",
  subtitle: "Creep",
  description: "Transfer a resource to a target structure or creep.",
  family: "creep",
  category: "Creep Actions",
  defaultConfig: {
    resource: "RESOURCE_ENERGY",
    amount: null,
    fallback: "moveTo",
  },
  configFields: [
    {
      type: "select",
      name: "resource",
      label: "Resource",
      options: resourceOptions,
    },
    { type: "number", name: "amount", label: "Amount", min: 0, step: 50 },
    {
      type: "select",
      name: "fallback",
      label: "Fallback",
      options: [
        { label: "Move closer", value: "moveTo" },
        { label: "Drop resource", value: "drop" },
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
      label: "Target",
      handleId: "input:target",
      optional: false,
    },
  ],
};

export const TransferNode = createNodeComponent(baseDefinition);

export const transferNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: TransferNode,
};
