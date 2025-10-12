import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.return",
  type: "flow.return",
  title: "Return",
  subtitle: "Flow control",
  description:
    "Stop execution for the current role and optionally return a value.",
  family: "flow",
  category: "Flow & Control",
  defaultConfig: {
    value: "undefined",
  },
  configFields: [
    {
      type: "text",
      name: "value",
      label: "Return value",
      placeholder: "Optional expression",
    },
  ],
  hasFlowOutput: false,
};

export const ReturnNode = createNodeComponent(baseDefinition);

export const returnNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: ReturnNode,
};
