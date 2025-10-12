import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.try",
  type: "flow.try",
  title: "Try / Catch",
  subtitle: "Error control",
  description: "Execute a block and recover from runtime errors gracefully.",
  family: "flow",
  category: "Flow & Control",
  defaultConfig: {
    errorVar: "err",
  },
  configFields: [
    {
      type: "text",
      name: "errorVar",
      label: "Error variable",
      placeholder: "err",
    },
  ],
  slots: [
    { name: "try", label: "Try" },
    { name: "catch", label: "Catch" },
    { name: "finally", label: "Finally" },
  ],
};

export const TryCatchNode = createNodeComponent(baseDefinition);

export const tryCatchNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: TryCatchNode,
};
