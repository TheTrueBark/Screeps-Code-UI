import type { NodeMeta } from "./schema";

const GLOBAL_COLOR = "#94a3b8";

/**
 * Global / Game nodes expose CPU stats, tick information, and analytics.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * CPU metric node. Docs: https://docs.screeps.com/api/#Game.cpu
   */
  "global.cpuInfo": {
    kind: "global.cpuInfo",
    title: "CPU Info",
    acronym: "CPU",
    icon: "cpu",
    family: "globalGame",
    category: "Global / Game / CPU",
    color: GLOBAL_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "metric",
        label: "Metric",
        type: "enum",
        default: "used",
        description:
          "CPU property to read (limit, used, bucket, shard limits).",
        options: [
          { value: "used", label: "Game.cpu.used" },
          { value: "limit", label: "Game.cpu.limit" },
          { value: "bucket", label: "Game.cpu.bucket" },
        ],
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:value",
        label: "Value",
        type: "number",
        description: "Current CPU metric value.",
      },
    ],
    editableExtensions: [
      {
        key: "threshold",
        label: "Threshold",
        type: "number",
        default: 0,
        description: "Trigger alerts when CPU metric crosses this threshold.",
      },
      {
        key: "alert",
        label: "Emit alert",
        type: "boolean",
        default: false,
        description: "Output notification or event when threshold is exceeded.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "data:value",
        side: "output",
        label: "Value",
        icon: "cpu",
        type: "number",
      },
    ],
    docs: {
      summary: "Read CPU metrics for dashboards and guards.",
      usage:
        "Select metric and optionally configure thresholds. Combine with notifications or scheduling to adapt to CPU pressure.",
      outputs: "- **Value:** CPU metric numeric value.",
      notes: "Planned integration with monitoring overlays.",
    },
    codegen: { emitter: "global" },
  },
  /**
   * Game time helper. Docs: https://docs.screeps.com/api/#Game.time
   */
  "global.gameTime": {
    kind: "global.gameTime",
    title: "Game Time",
    acronym: "TIME",
    icon: "clock",
    family: "globalGame",
    category: "Global / Game / CPU",
    color: GLOBAL_COLOR,
    availability: "planned",
    defaultSettings: [],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:time",
        label: "Game time",
        type: "number",
        description: "Current Game.time value.",
      },
    ],
    editableExtensions: [
      {
        key: "modulo",
        label: "Modulo",
        type: "number",
        default: 0,
        description:
          "Optional modulo of Game.time for scheduling calculations.",
      },
      {
        key: "delta",
        label: "Delta",
        type: "boolean",
        default: false,
        description:
          "Output ticks since last evaluation as an additional metric.",
      },
    ],
    ports: [
      {
        id: "data:time",
        side: "output",
        label: "Game time",
        icon: "clock",
        type: "number",
      },
    ],
    docs: {
      summary: "Expose Game.time for scheduling and analytics.",
      usage:
        "Use modulo to create periodic triggers or feed delta output into charts.",
      outputs: "- **Game time:** Current tick count.",
      notes:
        "Delta option assists with detecting CPU pauses or simulation resets.",
    },
    codegen: { emitter: "global" },
  },
  /**
   * GCL/GPL monitoring. Docs: https://docs.screeps.com/api/#Game.gcl
   */
  "global.progress": {
    kind: "global.progress",
    title: "Monitor GCL/GPL",
    acronym: "GCL",
    icon: "level",
    family: "globalGame",
    category: "Global / Game / CPU",
    color: GLOBAL_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "type",
        label: "Metric",
        type: "enum",
        default: "gcl",
        description: "Choose between GCL or GPL progress tracking.",
        options: [
          { value: "gcl", label: "Game.gcl" },
          { value: "gpl", label: "Game.gpl" },
        ],
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:level",
        label: "Level",
        type: "number",
        description: "Current level (GCL or GPL).",
      },
      {
        id: "data:progress",
        label: "Progress",
        type: "number",
        description: "Progress value toward next level.",
      },
      {
        id: "data:progressTotal",
        label: "Progress total",
        type: "number",
        description: "Total progress required for next level.",
      },
    ],
    editableExtensions: [
      {
        key: "notify",
        label: "Notify",
        type: "boolean",
        default: false,
        description: "Send notification when level increases.",
      },
      {
        key: "threshold",
        label: "Alert threshold",
        type: "number",
        default: 0.95,
        description: "Trigger alert when progress exceeds this ratio.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "data:level",
        side: "output",
        label: "Level",
        icon: "level",
        type: "number",
      },
      {
        id: "data:progress",
        side: "output",
        label: "Progress",
        icon: "level",
        type: "number",
      },
      {
        id: "data:progressTotal",
        side: "output",
        label: "Progress total",
        icon: "level",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Monitor global control level (GCL) or power level (GPL) progress.",
      usage:
        "Use outputs to feed dashboards, trigger celebrations, or adjust strategy as levels change.",
      outputs:
        "- **Level:** Current level.\n- **Progress:** Current progress value.\n- **Progress total:** Total progress required.",
      notes: "Alerts help coordinate upgrade pushes before level thresholds.",
    },
    codegen: { emitter: "global" },
  },
};
