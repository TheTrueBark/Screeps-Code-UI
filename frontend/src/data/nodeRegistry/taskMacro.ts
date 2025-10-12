import type { NodeMeta } from "./schema";

const TASK_COLOR = "#facc15";

/**
 * Task / Macro nodes describe higher-level workflow composition patterns.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Define reusable task pipelines.
   */
  "task.define": {
    kind: "task.define",
    title: "Define Task",
    acronym: "TD",
    icon: "task",
    family: "taskMacro",
    category: "Task / Macro / Composition",
    color: TASK_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "name",
        label: "Task name",
        type: "string",
        default: "refill",
        description: "Unique identifier for the macro task.",
      },
      {
        key: "parameters",
        label: "Parameters",
        type: "list",
        default: [{ key: "target", type: "string", default: "" }],
        description: "Parameter definitions (key, type, default).",
      },
      {
        key: "visibility",
        label: "Visibility",
        type: "enum",
        default: "public",
        description: "Control whether the task is callable from other files.",
        options: [
          { value: "public", label: "Public" },
          { value: "private", label: "Private" },
        ],
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "slot:body",
        label: "Body",
        type: "flow",
        description: "Flow block executed when the task is invoked.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "reuseMemory",
        label: "Reusable memory",
        type: "boolean",
        default: true,
        description: "Persist task-local memory between ticks.",
      },
      {
        key: "returnSignature",
        label: "Return signature",
        type: "string",
        default: "{ status: 'OK' }",
        description: "Document the structure of data returned by the task.",
        advanced: true,
      },
    ],
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
      summary: "Define a reusable flow of nodes parameterized by inputs.",
      usage:
        "Create task wrappers for repeated logic. Expose parameters to allow callers to inject context data.",
      outputs: "- **Body:** Flow branch executed whenever the task runs.",
      notes: "Use visibility to scope tasks to specific files or modules.",
    },
    codegen: { emitter: "task" },
  },
  /**
   * Invoke defined tasks with parameter overrides.
   */
  "task.call": {
    kind: "task.call",
    title: "Call Task",
    acronym: "CT",
    icon: "task",
    family: "taskMacro",
    category: "Task / Macro / Composition",
    color: TASK_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "name",
        label: "Task name",
        type: "string",
        default: "refill",
        description: "Name of the task definition to invoke.",
      },
      {
        key: "arguments",
        label: "Arguments",
        type: "json",
        default: {},
        description: "Argument overrides supplied when calling the task.",
      },
    ],
    defaultInputs: [
      {
        id: "input:args",
        label: "Args",
        type: "object",
        optional: true,
        description: "Object merged into the configured argument map.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:return",
        label: "Return",
        type: "any",
        description: "Return value from the task execution.",
      },
    ],
    editableExtensions: [
      {
        key: "fallbackArgs",
        label: "Fallback args",
        type: "json",
        default: {},
        description:
          "Arguments used when neither config nor input provides a key.",
      },
      {
        key: "partialMerge",
        label: "Partial merge",
        type: "boolean",
        default: true,
        description:
          "Merge provided args with defaults instead of replacing them entirely.",
      },
      {
        key: "async",
        label: "Async invocation",
        type: "boolean",
        default: false,
        description: "Schedule the task to continue on future ticks (planned).",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:args",
        side: "input",
        label: "Args",
        icon: "task",
        type: "object",
      },
      {
        id: "data:return",
        side: "output",
        label: "Return",
        icon: "task",
        type: "object",
      },
    ],
    docs: {
      summary: "Invoke reusable tasks with configurable arguments.",
      usage:
        "Provide an argument object or rely on defaults defined in the task. The return output carries structured results when the task completes.",
      inputs: "- **Args:** Object merged into the configured argument map.",
      outputs: "- **Return:** Data returned by the task body.",
      notes:
        "Async extension enables multi-tick orchestration when combined with queues.",
    },
    codegen: { emitter: "task" },
  },
  /**
   * Task parallel composition placeholder.
   */
  "task.parallel": {
    kind: "task.parallel",
    title: "Parallel Tasks",
    acronym: "TP",
    icon: "task",
    family: "taskMacro",
    category: "Task / Macro / Composition",
    color: TASK_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "strategy",
        label: "Strategy",
        type: "enum",
        default: "all",
        description:
          "Decide whether to wait for all child tasks or race the fastest.",
        options: [
          { value: "all", label: "All complete" },
          { value: "race", label: "First success" },
        ],
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "slot:body",
        label: "Tasks",
        type: "flow",
        description: "Slot to nest task call nodes for parallel execution.",
        flow: true,
      },
      {
        id: "data:result",
        label: "Summary",
        type: "object",
        description: "Aggregate result once parallel execution finishes.",
      },
    ],
    editableExtensions: [
      {
        key: "maxConcurrency",
        label: "Max concurrency",
        type: "number",
        default: 4,
        description: "Limit number of tasks running simultaneously.",
        advanced: true,
      },
      {
        key: "errorMode",
        label: "Error mode",
        type: "enum",
        default: "collect",
        description: "Control error handling across child tasks.",
        options: [
          { value: "collect", label: "Collect errors" },
          { value: "failFast", label: "Fail fast" },
        ],
        advanced: true,
      },
    ],
    ports: [
      {
        id: "slot:body",
        side: "output",
        label: "Tasks",
        icon: "task",
        type: "flow",
      },
      {
        id: "data:result",
        side: "output",
        label: "Summary",
        icon: "task",
        type: "object",
      },
    ],
    docs: {
      summary: "Execute multiple tasks in parallel and collect results.",
      usage:
        "Nest task call nodes inside the Tasks slot. Configure strategy and concurrency to balance throughput versus CPU.",
      outputs:
        "- **Tasks:** Flow region to populate with child task calls.\n- **Summary:** Aggregated completion status.",
      notes: "Planned node enabling future task scheduler integrations.",
    },
    codegen: { emitter: "task" },
  },
};
