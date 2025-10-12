import type { NodeMeta } from "./schema";

const STRUCTURE_COLOR = "#f97316";

/**
 * Structure logic nodes encapsulate structure operations and automation macros.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * StructureSpawn.spawnCreep helper. Docs: https://docs.screeps.com/api/#StructureSpawn.spawnCreep
   */
  "structure.spawn": {
    kind: "structure.spawn",
    title: "Spawn Creep",
    acronym: "SP",
    icon: "spawn",
    family: "structureLogic",
    category: "Structure / Building / Logic",
    color: STRUCTURE_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "namePrefix",
        label: "Name prefix",
        type: "string",
        default: "unit",
        description:
          "Prefix applied to spawned creeps; unique suffixes are auto-added.",
      },
      {
        key: "role",
        label: "Role label",
        type: "string",
        default: "worker",
        description: "Role or behavior key persisted into creep memory.",
      },
      {
        key: "bodyStrategy",
        label: "Body strategy",
        type: "enum",
        default: "balanced",
        description: "Select the body composition strategy.",
        options: [
          { value: "balanced", label: "Balanced" },
          { value: "hauler", label: "Hauler" },
          { value: "custom", label: "Custom" },
        ],
      },
      {
        key: "fixedBody",
        label: "Fixed body",
        type: "list",
        default: ["WORK", "CARRY", "MOVE"],
        description: "Explicit body array used when strategy = custom.",
      },
      {
        key: "energyCap",
        label: "Energy cap",
        type: "number",
        default: 550,
        description:
          "Maximum energy budget to allocate when generating body parts.",
      },
      {
        key: "memoryTemplate",
        label: "Memory template",
        type: "json",
        default: { role: "worker" },
        description: "JSON template merged into the new creep's memory.",
      },
    ],
    defaultInputs: [
      {
        id: "input:spawn",
        label: "Spawn",
        type: "StructureSpawn",
        description: "Optional spawn structure override.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from spawnCreep.",
      },
      {
        id: "data:body",
        label: "Body",
        type: "BodyPartConstant[]",
        description: "Final body array used for the spawn attempt.",
      },
    ],
    editableExtensions: [
      {
        key: "priority",
        label: "Spawn priority",
        type: "enum",
        default: "normal",
        description:
          "Placement priority used when multiple spawn tasks are queued.",
        options: [
          { value: "critical", label: "Critical" },
          { value: "normal", label: "Normal" },
          { value: "low", label: "Low" },
        ],
        advanced: true,
      },
      {
        key: "waitForEnergy",
        label: "Wait for energy",
        type: "boolean",
        default: true,
        description:
          "Delay spawning until the room energy available meets the cost.",
      },
      {
        key: "memoryInject",
        label: "Memory injection",
        type: "json",
        default: {},
        description: "Additional memory fields inserted before spawn resolves.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:spawn",
        side: "input",
        label: "Spawn",
        icon: "spawn",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "spawn",
        type: "number",
      },
      {
        id: "data:body",
        side: "output",
        label: "Body",
        icon: "spawn",
        type: "array",
      },
    ],
    docs: {
      summary: "Spawn creeps with configurable body and memory templates.",
      usage:
        "Connect an optional spawn structure or allow auto-selection. Configure body strategy, energy cap, and memory template to match your colony plan.",
      inputs: "- **Spawn:** Specific StructureSpawn to use (optional).",
      outputs:
        "- **Result:** Screeps spawn return code.\n- **Body:** Actual body parts used for the attempt.",
      notes:
        "Priority and energy gating integrate with the macro scheduler to prevent starvation.",
    },
    codegen: { emitter: "structure" },
  },
  /**
   * StructureTower automation. Docs: https://docs.screeps.com/api/#StructureTower.attack
   */
  "structure.tower": {
    kind: "structure.tower",
    title: "Tower Logic",
    acronym: "TW",
    icon: "tower",
    family: "structureLogic",
    category: "Structure / Building / Logic",
    color: STRUCTURE_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "priorities",
        label: "Priority order",
        type: "list",
        default: ["heal", "attack", "repair"],
        description:
          "Ordered list of actions the tower should attempt each tick.",
      },
      {
        key: "healThreshold",
        label: "Heal threshold",
        type: "number",
        default: 0.75,
        description: "Heal friendlies whose hits ratio falls below this value.",
      },
      {
        key: "repairThreshold",
        label: "Repair threshold",
        type: "number",
        default: 0.4,
        description:
          "Repair structures whose hits ratio falls below this value.",
      },
    ],
    defaultInputs: [
      {
        id: "input:tower",
        label: "Tower",
        type: "StructureTower",
        optional: true,
        description: "Optional tower reference overriding room auto-selection.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Action",
        type: "string",
        description:
          "Name of the action executed this tick (heal, attack, repair, idle).",
      },
    ],
    editableExtensions: [
      {
        key: "energyGate",
        label: "Energy gate",
        type: "number",
        default: 0.25,
        description:
          "Skip non-critical actions when tower energy ratio is below this threshold.",
        advanced: true,
      },
      {
        key: "safeModeOverride",
        label: "Safe-mode override",
        type: "boolean",
        default: false,
        description: "Allow aggressive actions even when room is in safe mode.",
        advanced: true,
      },
      {
        key: "fallbackTarget",
        label: "Fallback target",
        type: "string",
        default: "closestHostile",
        description:
          "Macro identifier controlling targeting heuristics when multiple hostiles exist.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:tower",
        side: "input",
        label: "Tower",
        icon: "tower",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Action",
        icon: "tower",
        type: "string",
      },
    ],
    docs: {
      summary:
        "Execute prioritized tower behaviors for defense, healing, and repairs.",
      usage:
        "Provide a tower or allow automatic selection of all towers in the room. Configure priority order and thresholds per colony policy.",
      inputs: "- **Tower:** Specific tower to control (optional).",
      outputs: "- **Action:** Name of the action executed this tick.",
      notes: "Energy gating prevents draining towers during prolonged sieges.",
    },
    codegen: { emitter: "structure" },
  },
  /**
   * StructureLink.transferEnergy helper. Docs: https://docs.screeps.com/api/#StructureLink.transferEnergy
   */
  "structure.linkSend": {
    kind: "structure.linkSend",
    title: "Link Transfer",
    acronym: "LN",
    icon: "link",
    family: "structureLogic",
    category: "Structure / Building / Logic",
    color: STRUCTURE_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "amount",
        label: "Amount",
        type: "number",
        default: 0,
        description: "Energy amount to send (0 sends all available).",
      },
    ],
    defaultInputs: [
      {
        id: "input:from",
        label: "From link",
        type: "StructureLink",
        description: "Link sending the energy.",
      },
      {
        id: "input:to",
        label: "To link",
        type: "StructureLink",
        description: "Receiving link.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from transferEnergy.",
      },
    ],
    editableExtensions: [
      {
        key: "balance",
        label: "Auto-balance",
        type: "boolean",
        default: true,
        description:
          "Calculate amount automatically to balance link network energy.",
      },
      {
        key: "threshold",
        label: "Send threshold",
        type: "number",
        default: 0.75,
        description:
          "Only send when source link energy ratio exceeds this value.",
        advanced: true,
      },
      {
        key: "cooldownSkip",
        label: "Skip on cooldown",
        type: "boolean",
        default: true,
        description:
          "Skip transfer when the link is on cooldown instead of returning an error.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:from",
        side: "input",
        label: "From",
        icon: "link",
        type: "object",
      },
      {
        id: "input:to",
        side: "input",
        label: "To",
        icon: "link",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "link",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Transfer energy between links with optional balancing heuristics.",
      usage:
        "Provide source and destination links. Enable auto-balance to compute energy based on room budgets.",
      inputs: "- **From/To:** Link structures participating in the transfer.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Threshold controls early exit to preserve link energy for defense.",
    },
    codegen: { emitter: "structure" },
  },
  /**
   * Terminal market interactions. Docs: https://docs.screeps.com/api/#StructureTerminal
   */
  "structure.terminalMarket": {
    kind: "structure.terminalMarket",
    title: "Terminal / Market",
    acronym: "TM",
    icon: "terminal",
    family: "structureLogic",
    category: "Structure / Building / Logic",
    color: STRUCTURE_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "deal",
        description:
          "Select whether to create orders, execute deals, or cancel orders.",
        options: [
          { value: "deal", label: "Execute deal" },
          { value: "create", label: "Create order" },
          { value: "cancel", label: "Cancel order" },
        ],
      },
      {
        key: "resource",
        label: "Resource",
        type: "string",
        default: "RESOURCE_ENERGY",
        description: "Resource type involved in the transaction.",
      },
      {
        key: "price",
        label: "Price",
        type: "number",
        default: 1,
        description: "Credits per unit for create/deal operations.",
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        default: 1000,
        description: "Quantity to trade.",
      },
    ],
    defaultInputs: [
      {
        id: "input:terminal",
        label: "Terminal",
        type: "StructureTerminal",
        optional: true,
        description:
          "Terminal executing the transaction (defaults to owned terminal).",
      },
      {
        id: "input:orderId",
        label: "Order ID",
        type: "string",
        description: "Existing order identifier for deal/cancel modes.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code or credits delta from terminal operation.",
      },
    ],
    editableExtensions: [
      {
        key: "maxCost",
        label: "Max transaction cost",
        type: "number",
        default: 3000,
        description: "Abort deals whose energy cost exceeds this limit.",
        advanced: true,
      },
      {
        key: "margin",
        label: "Minimum margin",
        type: "number",
        default: 0.05,
        description:
          "Ensure sell orders maintain this profit margin over average price.",
        advanced: true,
      },
      {
        key: "routing",
        label: "Fallback routing",
        type: "string",
        default: "nearest",
        description:
          "Strategy for selecting alternative rooms when the primary terminal is busy.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:terminal",
        side: "input",
        label: "Terminal",
        icon: "terminal",
        type: "object",
      },
      {
        id: "input:orderId",
        side: "input",
        label: "Order ID",
        icon: "terminal",
        type: "string",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "terminal",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Automate terminal market interactions including deals and order management.",
      usage:
        "Configure mode, resource, price, and amount. Provide optional order IDs for existing market entries.",
      inputs:
        "- **Terminal:** StructureTerminal executing the trade.\n- **Order ID:** Market order identifier for deal/cancel.",
      outputs: "- **Result:** Screeps return code or credits impact.",
      notes:
        "Cost and margin guards help avoid unfavorable trades during price swings.",
    },
    codegen: { emitter: "structure" },
  },
  /**
   * StructureFactory / StructureLab automation placeholder. Docs: https://docs.screeps.com/api/#StructureFactory
   */
  "structure.factory": {
    kind: "structure.factory",
    title: "Factory / Reaction",
    acronym: "FC",
    icon: "factory",
    family: "structureLogic",
    category: "Structure / Building / Logic",
    color: STRUCTURE_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "recipe",
        label: "Reaction recipe",
        type: "string",
        default: "utrium_bar",
        description: "Resource or compound to produce in the factory chain.",
      },
      {
        key: "batchSize",
        label: "Batch size",
        type: "number",
        default: 10,
        description: "Units per production run.",
      },
    ],
    defaultInputs: [
      {
        id: "input:factory",
        label: "Factory",
        type: "StructureFactory | StructureLab",
      },
      {
        id: "input:resources",
        label: "Resources",
        type: "Record<string, number>",
        description: "Input resource amounts for the reaction.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from runReaction/produce.",
      },
    ],
    editableExtensions: [
      {
        key: "schedule",
        label: "Batch scheduling",
        type: "enum",
        default: "continuous",
        description:
          "Control how often batches run (continuous, windowed, manual).",
        options: [
          { value: "continuous", label: "Continuous" },
          { value: "window", label: "Windowed" },
          { value: "manual", label: "Manual" },
        ],
      },
      {
        key: "cooldownGate",
        label: "Cooldown gate",
        type: "boolean",
        default: true,
        description:
          "Wait for labs to clear cooldown before scheduling next batch.",
      },
    ],
    ports: [
      {
        id: "input:factory",
        side: "input",
        label: "Factory",
        icon: "factory",
        type: "object",
      },
      {
        id: "input:resources",
        side: "input",
        label: "Resources",
        icon: "factory",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "factory",
        type: "number",
      },
    ],
    docs: {
      summary: "Plan compound reactions or factory production batches.",
      usage:
        "Provide factory/lab references and required resource inputs. Configure recipe name and batch size to drive scheduling.",
      inputs:
        "- **Factory:** Structure running the process.\n- **Resources:** Resource map for inputs.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Planned node awaiting integration with factory management dashboards.",
    },
    codegen: { emitter: "structure" },
  },
};
