import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { TASK_PARAM_TYPES } from "../../../../shared/constants";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "task.define",
  type: "task.define",
  title: "Define Task",
  subtitle: "Tasks",
  description:
    "Create a named callable task with its own entry branch and parameter schema.",
  family: "task",
  category: "Tasks",
  defaultConfig: {
    taskName: "refill",
    params: [{ key: "min", type: "number", default: 50 }],
  },
  configFields: [
    {
      type: "text",
      name: "taskName",
      label: "Task name",
      placeholder: "refill",
    },
    {
      type: "json",
      name: "params",
      label: "Parameters",
      helper:
        "Array of { key, type, default } objects. Allowed types: " +
        TASK_PARAM_TYPES.map((option) => option.value).join(", "),
    },
  ],
  slots: [{ name: "body", label: "Body" }],
};

export const DefineTaskNode = createNodeComponent(baseDefinition);

export const defineTaskNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: DefineTaskNode,
};
