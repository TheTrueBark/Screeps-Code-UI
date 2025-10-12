import type { NodeMeta } from "./schema";

const POWER_COLOR = "#f472b6";

/**
 * Power nodes wrap power creep abilities, boosts, and OPS resource logic.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Power creep operation executor. Docs: https://docs.screeps.com/api/#PowerCreep.usePower
   */
  "power.use": {
    kind: "power.use",
    title: "Use Power",
    acronym: "UP",
    icon: "power",
    family: "power",
    category: "Power / Power Creeps / Boosts",
    color: POWER_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "power",
        label: "Power constant",
        type: "string",
        default: "PWR_OPERATE_EXTENSION",
        description: "Power constant to activate (OP_ or PWR_*).",
      },
      {
        key: "target",
        label: "Target selector",
        type: "enum",
        default: "room",
        description: "Determine how the target input is resolved.",
        options: [
          { value: "room", label: "Room" },
          { value: "structure", label: "Structure" },
          { value: "creep", label: "Creep" },
        ],
      },
    ],
    defaultInputs: [
      {
        id: "input:powerCreep",
        label: "Power creep",
        type: "PowerCreep",
        description: "Power creep performing the action.",
      },
      {
        id: "input:target",
        label: "Target",
        type: "any",
        optional: true,
        description: "Target object required by the selected power.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from usePower.",
      },
    ],
    editableExtensions: [
      {
        key: "opsBudget",
        label: "OPS budget",
        type: "number",
        default: 100,
        description:
          "Minimum OPS resource to maintain before firing optional powers.",
        advanced: true,
      },
      {
        key: "notify",
        label: "Notify failure",
        type: "boolean",
        default: false,
        description: "Send notification when the power fails to execute.",
      },
    ],
    ports: [
      {
        id: "input:powerCreep",
        side: "input",
        label: "Power creep",
        icon: "power",
        type: "object",
      },
      {
        id: "input:target",
        side: "input",
        label: "Target",
        icon: "power",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "power",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Activate power creep abilities with optional OPS and failure handling.",
      usage:
        "Provide a power creep and target object. Configure power constant and optional OPS safeguards before invoking.",
      inputs:
        "- **Power creep:** Power creep instance.\n- **Target:** Object required by the power (optional).",
      outputs: "- **Result:** Screeps return code.",
      notes: "OPS budgeting prevents accidental depletion of vital abilities.",
    },
    codegen: { emitter: "power" },
  },
  /**
   * Boost management for creeps. Docs: https://docs.screeps.com/api/#StructureLab
   */
  "power.boost": {
    kind: "power.boost",
    title: "Apply Boost",
    acronym: "BT",
    icon: "power",
    family: "power",
    category: "Power / Power Creeps / Boosts",
    color: POWER_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "resource",
        label: "Boost mineral",
        type: "string",
        default: "RESOURCE_UTRIUM_LEMERGITE",
        description: "Lab mineral used for boosting.",
      },
      {
        key: "parts",
        label: "Body parts",
        type: "list",
        default: ["WORK"],
        description:
          "Body parts to boost (automatically filtered by lab availability).",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Creep receiving the boost.",
      },
      {
        id: "input:lab",
        label: "Lab",
        type: "StructureLab",
        optional: true,
        description: "Specific lab to use (defaults to nearest available).",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from lab.boostCreep.",
      },
    ],
    editableExtensions: [
      {
        key: "queue",
        label: "Boost queue",
        type: "boolean",
        default: true,
        description: "Add boost request to a global queue when lab is busy.",
      },
      {
        key: "fallback",
        label: "Fallback role",
        type: "string",
        default: "unboosted",
        description: "Role assigned if boost cannot be applied.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "power",
        type: "object",
      },
      {
        id: "input:lab",
        side: "input",
        label: "Lab",
        icon: "power",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "power",
        type: "number",
      },
    ],
    docs: {
      summary: "Coordinate creep boosting using labs and queueing heuristics.",
      usage:
        "Provide the creep (and optionally lab) then configure mineral and parts. Queueing ensures sequential boosting when labs are shared.",
      inputs:
        "- **Creep:** Unit to boost.\n- **Lab:** Structure applying the boost (optional).",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Fallback role can redirect the creep to a non-boosted duty cycle.",
    },
    codegen: { emitter: "power" },
  },
  /**
   * Power spawn management node.
   */
  "power.powerSpawn": {
    kind: "power.powerSpawn",
    title: "Power Spawn",
    acronym: "PS",
    icon: "power",
    family: "power",
    category: "Power / Power Creeps / Boosts",
    color: POWER_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "process",
        description: "Choose between generating power or processing raw power.",
        options: [
          { value: "process", label: "Process power" },
          { value: "generate", label: "Generate ops" },
        ],
      },
    ],
    defaultInputs: [
      {
        id: "input:powerSpawn",
        label: "Power spawn",
        type: "StructurePowerSpawn",
        description: "Target power spawn structure.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from power spawn operation.",
      },
    ],
    editableExtensions: [
      {
        key: "opsReserve",
        label: "OPS reserve",
        type: "number",
        default: 50,
        description: "Maintain this OPS reserve before generating new OPS.",
      },
      {
        key: "powerBuffer",
        label: "Power buffer",
        type: "number",
        default: 100,
        description:
          "Minimum raw power stockpile to keep before processing stops.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:powerSpawn",
        side: "input",
        label: "Power spawn",
        icon: "power",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "power",
        type: "number",
      },
    ],
    docs: {
      summary: "Manage power spawn operations including OPS generation.",
      usage:
        "Point to a power spawn and configure thresholds. The node can enforce OPS and power reserves to stabilize production.",
      inputs: "- **Power spawn:** Structure executing the operation.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Future integrations will sync with economy dashboards and notifications.",
    },
    codegen: { emitter: "power" },
  },
};
