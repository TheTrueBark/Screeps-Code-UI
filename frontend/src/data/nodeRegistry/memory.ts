import type { NodeMeta } from "./schema";

const MEMORY_COLOR = "#bb86fc";

export const nodes: Record<string, NodeMeta> = {
  "memory.read": {
    kind: "memory.read",
    title: "Memory Read",
    acronym: "MR",
    icon: "memory",
    family: "memory",
    category: "Memory",
    color: MEMORY_COLOR,
    ports: [
      { id: "data:value", side: "output", label: "Value", icon: "memory", type: "unknown", preview: true }
    ],
    docs: {
      summary: "Read a value from Memory, RoomMemory, or CreepMemory.",
      usage:
        "Specify the scope and dot path to retrieve. Provide a default JSON value to fall back when the path is missing.",
      outputs: "- **Value:** Retrieved value or the provided default when missing.",
      notes: "Returned data is JSON-serialized when shown in previews."
    },
    shortcuts: { focus: "M" },
    codegen: { emitter: "memory" }
  },
  "memory.write": {
    kind: "memory.write",
    title: "Memory Write",
    acronym: "MW",
    icon: "memory",
    family: "memory",
    category: "Memory",
    color: MEMORY_COLOR,
    autoExpand: true,
    ports: [
      { id: "input:value", side: "input", label: "Value", icon: "memory", type: "unknown", preview: true }
    ],
    docs: {
      summary: "Persist a value into Memory with optional merge semantics.",
      usage:
        "Connect a value and choose overwrite or merge mode. The node writes into the configured scope and path each tick.",
      inputs: "- **Value:** Data to persist into Memory.",
      notes: "When merge is enabled and both values are objects they are shallow-merged."
    },
    codegen: { emitter: "memory" }
  },
  "memory.delete": {
    kind: "memory.delete",
    title: "Memory Delete",
    acronym: "MD",
    icon: "memory",
    family: "memory",
    category: "Memory",
    color: MEMORY_COLOR,
    ports: [],
    docs: {
      summary: "Remove a value from Memory at the provided path.",
      usage:
        "Configure the scope and path to clean up. Use after transfers or once a target is complete.",
      notes: "No inputs are required; the node simply deletes the key when executed."
    },
    codegen: { emitter: "memory" }
  }
};
