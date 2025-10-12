import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { LOOP_TYPES } from "../../../../shared/constants";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.loop",
  type: "flow.loop",
  title: "Loop",
  subtitle: "Iteration",
  description: "Repeat a block using for/while semantics with guard rails.",
  family: "flowControl",
  category: "Flow & Control",
  defaultConfig: {
    loopType: "while",
    iterVarName: "i",
    maxIterations: 10,
    condition: "true",
  },
  configFields: [
    {
      type: "select",
      name: "loopType",
      label: "Loop type",
      options: LOOP_TYPES,
    },
    {
      type: "text",
      name: "iterVarName",
      label: "Iterator name",
      placeholder: "Optional for for-loops",
    },
    {
      type: "number",
      name: "maxIterations",
      label: "Max iterations",
      min: 1,
      step: 1,
    },
    {
      type: "text",
      name: "condition",
      label: "While condition",
    },
  ],
  slots: [
    { name: "body", label: "Body" },
    { name: "else", label: "Else" },
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

export const LoopNode = createNodeComponent(baseDefinition);

export const loopNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: LoopNode,
};
