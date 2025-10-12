import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { MEMORY_SCOPES } from "../../../../shared/constants";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "memory.write",
  type: "memory.write",
  title: "Memory Write",
  subtitle: "Memory",
  description: "Persist values into Memory with optional merge semantics.",
  family: "memory",
  category: "Memory",
  defaultConfig: {
    scope: "global",
    path: "creeps.harvester.target",
    merge: false,
  },
  configFields: [
    { type: "select", name: "scope", label: "Scope", options: MEMORY_SCOPES },
    { type: "text", name: "path", label: "Path", placeholder: "dot.path" },
    {
      type: "checkbox",
      name: "merge",
      label: "Merge objects instead of overwrite",
    },
  ],
  dataInputs: [
    { name: "value", label: "Value", handleId: "input:value", optional: false },
  ],
};

export const MemoryWriteNode = createNodeComponent(baseDefinition);

export const memoryWriteNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: MemoryWriteNode,
};
