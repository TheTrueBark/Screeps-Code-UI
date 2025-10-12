import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.schedule",
  type: "flow.schedule",
  title: "Schedule",
  subtitle: "Timing",
  description:
    "Gate execution to run every N ticks or when tick modulo matches.",
  family: "flowControl",
  category: "Flow & Control",
  defaultConfig: {
    mode: "every",
    interval: 5,
    offset: 0,
  },
  configFields: [
    {
      type: "select",
      name: "mode",
      label: "Mode",
      options: [
        { label: "Every N ticks", value: "every" },
        { label: "Tick modulo", value: "modulo" },
      ],
    },
    { type: "number", name: "interval", label: "Interval", min: 1, step: 1 },
    { type: "number", name: "offset", label: "Offset", min: 0, step: 1 },
  ],
  slots: [{ name: "body", label: "Body" }],
};

export const ScheduleNode = createNodeComponent(baseDefinition);

export const scheduleNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: ScheduleNode,
};
