import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { RESOURCES } from "../../../../shared/constants";

const resourceOptions = RESOURCES.map((resource) => ({
  label: resource.replace("RESOURCE_", ""),
  value: resource,
}));

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.withdraw",
  type: "creep.withdraw",
  title: "Withdraw",
  subtitle: "Creep",
  description: "Withdraw a resource from a container, storage or structure.",
  family: "creepActions",
  category: "Creep Actions",
  defaultConfig: {
    resource: "RESOURCE_ENERGY",
    amount: null,
  },
  configFields: [
    {
      type: "select",
      name: "resource",
      label: "Resource",
      options: resourceOptions,
    },
    { type: "number", name: "amount", label: "Amount", min: 0, step: 50 },
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

export const WithdrawNode = createNodeComponent(baseDefinition);

export const withdrawNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: WithdrawNode,
};
