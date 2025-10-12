import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.break",
  type: "flow.break",
  title: "Break / Continue",
  subtitle: "Loop control",
  description:
    "Control loop execution by breaking or continuing to next iteration.",
  family: "flow",
  category: "Flow & Control",
  defaultConfig: {
    mode: "break",
  },
  configFields: [
    {
      type: "select",
      name: "mode",
      label: "Mode",
      options: [
        { label: "Break", value: "break" },
        { label: "Continue", value: "continue" },
      ],
    },
  ],
  hasFlowOutput: false,
};

export const BreakContinueNode = createNodeComponent(baseDefinition);

export const breakContinueNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: BreakContinueNode,
};
