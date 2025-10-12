import type { NodeMeta } from "./schema";

const TASK_COLOR = "#facc15";

export const nodes: Record<string, NodeMeta> = {
  "task.define": {
    kind: "task.define",
    title: "Define Task",
    acronym: "DT",
    icon: "task",
    family: "task",
    category: "Tasks",
    color: TASK_COLOR,
    autoExpand: true,
    ports: [
      {
        id: "slot:body",
        side: "output",
        label: "Body",
        icon: "task",
        type: "flow",
      },
    ],
    docs: {
      summary:
        "Create a named callable task with its own entry branch and parameter schema.",
      usage:
        "Set the task name and parameter definitions. Connect the Body flow output to build the task implementation.",
      outputs: "- **Body:** Flow branch executed when the task is invoked.",
      notes: "Task names must be unique within a file.",
    },
    shortcuts: { duplicate: "D" },
    codegen: { emitter: "task" },
  },
  "task.call": {
    kind: "task.call",
    title: "Call Task",
    acronym: "CT",
    icon: "task",
    family: "task",
    category: "Tasks",
    color: TASK_COLOR,
    ports: [
      {
        id: "input:args",
        side: "input",
        label: "Args",
        icon: "task",
        type: "Record<string, unknown>",
        preview: true,
      },
    ],
    docs: {
      summary: "Invoke a previously defined task with arguments.",
      usage:
        "Choose the target task name and optionally provide arguments via configuration or the Args input.",
      inputs:
        "- **Args:** Optional record of runtime arguments overriding defaults.",
      notes:
        "Compilation validates that the task name exists in the current file.",
    },
    codegen: { emitter: "task" },
  },
};
