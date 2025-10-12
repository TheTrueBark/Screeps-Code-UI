import type { NodeMeta } from "./schema";

const STRUCT_COLOR = "#8b8f97";

export const nodes: Record<string, NodeMeta> = {
  "structure.spawn": {
    kind: "structure.spawn",
    title: "Spawn Creep",
    acronym: "SP",
    icon: "structure",
    family: "structure",
    category: "Structure Logic",
    color: STRUCT_COLOR,
    ports: [
      {
        id: "input:spawn",
        side: "input",
        label: "Spawn",
        icon: "structure",
        type: "StructureSpawn",
        required: false,
      },
    ],
    docs: {
      summary:
        "Spawn a new creep using the configured body strategy and memory template.",
      usage:
        "Connect a spawn structure or allow the node to auto-select an available spawn. Configure the body strategy, name prefix, and memory template to control the produced creep.",
      inputs: "- **Spawn:** Optional specific spawn structure to use.",
      outputs:
        "- **Result:** Emits flow success or failure via the node status.",
      notes:
        "Respects energy cap and room control level when building the body.",
    },
    codegen: { emitter: "structure" },
  },
  "structure.tower": {
    kind: "structure.tower",
    title: "Tower Logic",
    acronym: "TW",
    icon: "tower",
    family: "structure",
    category: "Structure Logic",
    color: STRUCT_COLOR,
    ports: [
      {
        id: "input:tower",
        side: "input",
        label: "Tower",
        icon: "tower",
        type: "StructureTower",
        required: false,
      },
    ],
    docs: {
      summary:
        "Configure priorities for tower healing, attacking, and repairing.",
      usage:
        "Provide a tower structure and set priority order plus thresholds. The node evaluates targets according to the configured priority sequence each tick.",
      inputs: "- **Tower:** Tower structure executing the logic.",
      notes: "Priorities accept arrays such as ['heal','attack','repair'].",
    },
    codegen: { emitter: "structure" },
  },
  "structure.linkSend": {
    kind: "structure.linkSend",
    title: "Link Transfer",
    acronym: "LK",
    icon: "link",
    family: "structure",
    category: "Structure Logic",
    color: STRUCT_COLOR,
    ports: [
      {
        id: "input:from",
        side: "input",
        label: "From",
        icon: "link",
        type: "StructureLink",
        required: true,
      },
      {
        id: "input:to",
        side: "input",
        label: "To",
        icon: "link",
        type: "StructureLink",
        required: true,
      },
    ],
    docs: {
      summary: "Send energy between two link structures.",
      usage:
        "Attach the source and destination links and optionally cap the amount. The node issues a transfer when the source has enough energy.",
      inputs:
        "- **From:** Source link providing energy.\n- **To:** Destination link receiving energy.",
      notes: "Checks cooldown before attempting a transfer.",
    },
    codegen: { emitter: "structure" },
  },
  "structure.terminalMarket": {
    kind: "structure.terminalMarket",
    title: "Terminal Market",
    acronym: "TM",
    icon: "terminal",
    family: "structure",
    category: "Structure Logic",
    color: STRUCT_COLOR,
    ports: [
      {
        id: "input:terminal",
        side: "input",
        label: "Terminal",
        icon: "terminal",
        type: "StructureTerminal",
        required: false,
      },
    ],
    docs: {
      summary: "Execute buy, sell, or deal operations through a terminal.",
      usage:
        "Configure resource, mode, price, and amount. Provide a terminal structure or allow the system to choose one in the room.",
      inputs:
        "- **Terminal:** Optional terminal structure executing the trade.",
      notes:
        "Automatically skips when orders cannot be fulfilled or cooldown prevents usage.",
    },
    codegen: { emitter: "structure" },
  },
};
