import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.switch",
  type: "flow.switch",
  title: "Switch",
  subtitle: "Branch",
  description: "Match against cases and route execution to matching branches.",
  family: "flow",
  category: "Flow & Control",
  defaultConfig: {
    key: "creep.memory.role",
    cases: [
      { label: "Harvester", matchValue: "harvester" },
      { label: "Hauler", matchValue: "hauler" },
    ],
    defaultBranch: "default",
  },
  configFields: [
    { type: "text", name: "key", label: "Key / Expression" },
    {
      type: "json",
      name: "cases",
      label: "Cases",
      helper: "Array of { label, matchValue } objects.",
    },
    { type: "text", name: "defaultBranch", label: "Default label" },
  ],
  slots: [
    { name: "case-0", label: "Case 1" },
    { name: "case-1", label: "Case 2" },
    { name: "default", label: "Default" },
  ],
  dataInputs: [
    {
      name: "key",
      label: "Key",
      handleId: "input:key",
      optional: true,
      configKey: "key",
    },
  ],
};

export const SwitchNode = createNodeComponent(baseDefinition);

export const switchNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: SwitchNode,
};
