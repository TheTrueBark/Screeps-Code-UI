import type { NodeMeta } from "./schema";

const MEMORY_COLOR = "#bb86fc";

/**
 * Memory & Data nodes abstract Memory operations and serialization helpers.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Memory read helper. Docs: https://docs.screeps.com/api/#Memory
   */
  "memory.read": {
    kind: "memory.read",
    title: "Memory Read",
    acronym: "MR",
    icon: "memory",
    family: "memoryData",
    category: "Memory & Data",
    color: MEMORY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "scope",
        label: "Scope",
        type: "enum",
        default: "global",
        description: "Select which Memory namespace to read from.",
        options: [
          { value: "global", label: "Memory" },
          { value: "rooms", label: "Memory.rooms" },
          { value: "creeps", label: "Memory.creeps" },
          { value: "flags", label: "Memory.flags" },
        ],
      },
      {
        key: "path",
        label: "Path",
        type: "string",
        default: "",
        description: "Dot-separated path resolved from the chosen scope.",
        placeholder: "rooms.W0N0.level",
      },
      {
        key: "fallback",
        label: "Fallback",
        type: "json",
        default: null,
        description: "Value returned when the path does not exist.",
      },
    ],
    defaultInputs: [
      {
        id: "input:scope",
        label: "Scope object",
        type: "object",
        description:
          "Optional object overriding the configured Memory scope (e.g., creep memory).",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:value",
        label: "Value",
        type: "any",
        description: "Value retrieved from Memory or fallback.",
      },
      {
        id: "data:exists",
        label: "Exists",
        type: "boolean",
        description: "Boolean flag indicating whether the path existed.",
      },
    ],
    editableExtensions: [
      {
        key: "typeCast",
        label: "Type cast",
        type: "enum",
        default: "auto",
        description:
          "Optionally cast the value to a specific type for downstream validation.",
        options: [
          { value: "auto", label: "Auto" },
          { value: "number", label: "Number" },
          { value: "string", label: "String" },
          { value: "array", label: "Array" },
          { value: "object", label: "Object" },
        ],
        advanced: true,
      },
      {
        key: "existsBranch",
        label: "Exists branch",
        type: "boolean",
        default: false,
        description:
          "Expose optional flow outputs when the key exists or not (planned).",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:scope",
        side: "input",
        label: "Scope",
        icon: "memory",
        type: "object",
      },
      {
        id: "data:value",
        side: "output",
        label: "Value",
        icon: "memory",
        type: "object",
      },
      {
        id: "data:exists",
        side: "output",
        label: "Exists",
        icon: "memory",
        type: "boolean",
      },
    ],
    docs: {
      summary:
        "Read data from Memory with optional default values and scope overrides.",
      usage:
        "Configure the scope and path or supply a custom scope object. Downstream nodes can inspect the Exists flag to determine if initialization is required.",
      inputs: "- **Scope object:** Override for Memory namespace (optional).",
      outputs:
        "- **Value:** Retrieved Memory value.\n- **Exists:** Boolean indicating presence of the path.",
      notes:
        "Type casting ensures downstream nodes receive strongly typed data.",
    },
    codegen: { emitter: "memory" },
  },
  /**
   * Memory write helper. Docs: https://docs.screeps.com/api/#Memory
   */
  "memory.write": {
    kind: "memory.write",
    title: "Memory Write",
    acronym: "MW",
    icon: "memory",
    family: "memoryData",
    category: "Memory & Data",
    color: MEMORY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "scope",
        label: "Scope",
        type: "enum",
        default: "global",
        description: "Memory namespace to mutate.",
        options: [
          { value: "global", label: "Memory" },
          { value: "rooms", label: "Memory.rooms" },
          { value: "creeps", label: "Memory.creeps" },
          { value: "flags", label: "Memory.flags" },
        ],
      },
      {
        key: "path",
        label: "Path",
        type: "string",
        default: "",
        description: "Dot-separated path to set within the scope.",
      },
      {
        key: "merge",
        label: "Merge mode",
        type: "boolean",
        default: true,
        description:
          "When true, merge objects instead of overwriting them entirely.",
      },
    ],
    defaultInputs: [
      {
        id: "input:value",
        label: "Value",
        type: "any",
        description: "Value to store at the Memory path.",
      },
      {
        id: "input:scope",
        label: "Scope object",
        type: "object",
        optional: true,
        description: "Optional override scope (e.g., creep.memory).",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "boolean",
        description: "Indicates whether the write succeeded.",
      },
    ],
    editableExtensions: [
      {
        key: "mergeStrategy",
        label: "Merge strategy",
        type: "enum",
        default: "shallow",
        description: "Choose between shallow merge, deep merge, or JSON patch.",
        options: [
          { value: "shallow", label: "Shallow" },
          { value: "deep", label: "Deep" },
          { value: "jsonPatch", label: "JSON Patch" },
        ],
        advanced: true,
      },
      {
        key: "ttl",
        label: "Expiration (ticks)",
        type: "number",
        default: 0,
        description:
          "Optional TTL; automatically removes the key after the specified ticks.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:value",
        side: "input",
        label: "Value",
        icon: "memory",
        type: "object",
      },
      {
        id: "input:scope",
        side: "input",
        label: "Scope",
        icon: "memory",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "memory",
        type: "boolean",
      },
    ],
    docs: {
      summary: "Persist values into Memory with merge and TTL capabilities.",
      usage:
        "Provide the value to store and configure scope/path. Use merge strategies to control how nested objects are combined.",
      inputs:
        "- **Value:** Data to persist.\n- **Scope:** Override Memory scope (optional).",
      outputs: "- **Result:** Boolean success flag.",
      notes:
        "TTL extension enables self-expiring cache entries for pathing or analysis data.",
    },
    codegen: { emitter: "memory" },
  },
  /**
   * Memory delete helper. Docs: https://docs.screeps.com/api/#Memory
   */
  "memory.delete": {
    kind: "memory.delete",
    title: "Memory Delete",
    acronym: "MD",
    icon: "memory",
    family: "memoryData",
    category: "Memory & Data",
    color: MEMORY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "scope",
        label: "Scope",
        type: "enum",
        default: "global",
        description: "Memory namespace for deletion.",
        options: [
          { value: "global", label: "Memory" },
          { value: "rooms", label: "Memory.rooms" },
          { value: "creeps", label: "Memory.creeps" },
          { value: "flags", label: "Memory.flags" },
        ],
      },
      {
        key: "path",
        label: "Path",
        type: "string",
        default: "",
        description: "Memory path to delete.",
      },
    ],
    defaultInputs: [
      {
        id: "input:scope",
        label: "Scope object",
        type: "object",
        optional: true,
        description: "Optional scope override.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "boolean",
        description: "True when the delete removed a key.",
      },
    ],
    editableExtensions: [
      {
        key: "cascade",
        label: "Cascade",
        type: "boolean",
        default: false,
        description: "Delete nested children recursively when enabled.",
        advanced: true,
      },
      {
        key: "condition",
        label: "Condition",
        type: "expression",
        default: "true",
        description:
          "Expression guard; delete occurs only when it evaluates truthy.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:scope",
        side: "input",
        label: "Scope",
        icon: "memory",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "memory",
        type: "boolean",
      },
    ],
    docs: {
      summary: "Remove keys from Memory with optional cascading behavior.",
      usage:
        "Configure scope/path and optionally guard deletions with expressions to avoid accidental data loss.",
      inputs: "- **Scope:** Override Memory scope (optional).",
      outputs: "- **Result:** True if the key was removed.",
      notes:
        "Cascade deletes entire subtrees, useful when cleaning cached structures.",
    },
    codegen: { emitter: "memory" },
  },
  /**
   * JSON patch / diff helper for Memory. Docs: https://jsonpatch.com/
   */
  "memory.patch": {
    kind: "memory.patch",
    title: "Memory Patch",
    acronym: "MP",
    icon: "memory",
    family: "memoryData",
    category: "Memory & Data",
    color: MEMORY_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "scope",
        label: "Scope",
        type: "enum",
        default: "global",
        description: "Memory namespace to patch.",
        options: [
          { value: "global", label: "Memory" },
          { value: "rooms", label: "Memory.rooms" },
          { value: "creeps", label: "Memory.creeps" },
        ],
      },
      {
        key: "path",
        label: "Path",
        type: "string",
        default: "",
        description: "Base path to apply JSON patch operations relative to.",
      },
    ],
    defaultInputs: [
      {
        id: "input:operations",
        label: "Operations",
        type: "Array",
        description: "JSON Patch operations array.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "boolean",
        description: "True when patch applied successfully.",
      },
    ],
    editableExtensions: [
      {
        key: "dryRun",
        label: "Dry run",
        type: "boolean",
        default: false,
        description:
          "Simulate the patch and output diff without mutating Memory.",
      },
    ],
    ports: [
      {
        id: "input:operations",
        side: "input",
        label: "Operations",
        icon: "memory",
        type: "array",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "memory",
        type: "boolean",
      },
    ],
    docs: {
      summary: "Apply JSON patch operations to Memory objects.",
      usage:
        "Provide an array of patch operations and configure scope/path. Dry-run mode can be used to preview results before committing.",
      inputs: "- **Operations:** JSON Patch operations array.",
      outputs: "- **Result:** Success flag.",
      notes: "Marked planned pending integration with diff visualizers.",
    },
    codegen: { emitter: "memory" },
  },
};
