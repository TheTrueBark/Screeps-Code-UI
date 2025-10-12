import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.if",
  type: "flow.if",
  title: "If",
  subtitle: "Branch",
  description: "Branch execution depending on a boolean condition.",
  family: "flowControl",
  category: "Flow & Control",
  defaultConfig: {
    condition: "creep.store.getFreeCapacity() === 0",
    shortCircuit: true,
  },
  configFields: [
    {
      type: "text",
      name: "condition",
      label: "Condition",
      placeholder: "Boolean expression",
    },
    {
      type: "checkbox",
      name: "shortCircuit",
      label: "Short circuit when true",
    },
  ],
  slots: [
    { name: "true", label: "True" },
    { name: "false", label: "False" },
  ],
  dataInputs: [
    {
      name: "cond",
      label: "Condition",
      handleId: "input:cond",
      optional: true,
      configKey: "condition",
    },
  ],
};

export const IfNode = createNodeComponent(baseDefinition);

export const ifNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: IfNode,
};
