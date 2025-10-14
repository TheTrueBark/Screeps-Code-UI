import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "flow.start",
  type: "flow.start",
  title: "Start",
  subtitle: "Entry",
  description: "Entry point executed once per tick for the active file.",
  family: "flowControl",
  category: "Flow & Control",
  defaultConfig: {
    label: "Tick entry",
    flowMode: "next",
    scheduleMode: "everyTick",
    tickSpan: 1,
    moduloOffset: 0,
  },
  configFields: [
    {
      type: "text",
      name: "label",
      label: "Label",
      placeholder: "Optional description",
    },
    {
      type: "select",
      name: "flowMode",
      label: "Flow behaviour",
      options: [
        { label: "Next", value: "next" },
        { label: "Schedule", value: "schedule" },
      ],
    },
    {
      type: "select",
      name: "scheduleMode",
      label: "Schedule",
      options: [
        { label: "Every tick", value: "everyTick" },
        { label: "Every N ticks", value: "interval" },
        { label: "Modulo", value: "modulo" },
      ],
      visible: (config) => config.flowMode === "schedule",
    },
    {
      type: "number",
      name: "tickSpan",
      label: "Tick interval",
      min: 1,
      step: 1,
      visible: (config) =>
        config.flowMode === "schedule" &&
        (config.scheduleMode === "interval" || config.scheduleMode === "modulo"),
    },
    {
      type: "number",
      name: "moduloOffset",
      label: "Modulo offset",
      min: 0,
      step: 1,
      visible: (config) =>
        config.flowMode === "schedule" && config.scheduleMode === "modulo",
    },
  ],
  hasFlowInput: false,
  hasFlowOutput: true,
};

export const StartNode = createNodeComponent(baseDefinition);

export const startNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: StartNode,
};
