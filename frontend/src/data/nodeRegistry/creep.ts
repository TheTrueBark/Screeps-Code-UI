import type { NodeMeta } from "./schema";

const CREEP_COLOR = "#8b8f97";

export const nodes: Record<string, NodeMeta> = {
  "creep.move": {
    kind: "creep.move",
    title: "Move",
    acronym: "MV",
    icon: "creep",
    family: "creep",
    category: "Creep Actions",
    color: CREEP_COLOR,
    autoExpand: true,
    ports: [
      { id: "input:creep", side: "input", label: "Creep", icon: "creep", type: "Creep", required: false },
      { id: "input:targetPos", side: "input", label: "Target", icon: "target", type: "RoomPosition", preview: true }
    ],
    docs: {
      summary: "Move a creep using configurable adapters and pathing parameters.",
      usage:
        "Connect a creep reference and target position. Configure adapter options such as range and reuse path to tune motion.",
      inputs:
        "- **Creep:** The unit to move. Defaults to the active creep if omitted.\n- **Target:** Destination room position or structure.",
      notes: "Supports Traveler or built-in pathfinding depending on configuration."
    },
    shortcuts: { center: "C" },
    codegen: { emitter: "creep" }
  },
  "creep.harvest": {
    kind: "creep.harvest",
    title: "Harvest",
    acronym: "HV",
    icon: "harvest",
    family: "creep",
    category: "Creep Actions",
    color: CREEP_COLOR,
    ports: [
      { id: "input:creep", side: "input", label: "Creep", icon: "creep", type: "Creep" },
      { id: "input:target", side: "input", label: "Source", icon: "harvest", type: "Source | Mineral", preview: true }
    ],
    docs: {
      summary: "Orders a creep to harvest energy or minerals from a target.",
      usage:
        "Provide the creep and a source target. Configure the fallback strategy to move closer or skip when out of range.",
      inputs:
        "- **Creep:** Harvester performing the action.\n- **Source:** Energy source or mineral deposit to harvest.",
      outputs: "- **Status:** Implicit OK/ERR result emitted through the flow output.",
      notes: "Automatically skips when the creep store is full."
    },
    codegen: { emitter: "creep" }
  },
  "creep.transfer": {
    kind: "creep.transfer",
    title: "Transfer",
    acronym: "TR",
    icon: "transfer",
    family: "creep",
    category: "Creep Actions",
    color: CREEP_COLOR,
    ports: [
      { id: "input:creep", side: "input", label: "Creep", icon: "creep", type: "Creep" },
      { id: "input:target", side: "input", label: "Target", icon: "transfer", type: "Structure | Creep", preview: true }
    ],
    docs: {
      summary: "Transfer a resource to a structure or allied creep.",
      usage:
        "Specify which resource and amount to deliver. The node handles moving closer or dropping if configured as a fallback.",
      inputs:
        "- **Creep:** Unit carrying the resource.\n- **Target:** Structure or creep receiving the transfer.",
      notes: "Leave amount blank to send everything of the selected resource."
    },
    codegen: { emitter: "creep" }
  },
  "creep.build": {
    kind: "creep.build",
    title: "Build",
    acronym: "BD",
    icon: "structure",
    family: "creep",
    category: "Creep Actions",
    color: CREEP_COLOR,
    ports: [
      { id: "input:creep", side: "input", label: "Creep", icon: "creep", type: "Creep" },
      { id: "input:target", side: "input", label: "Site", icon: "structure", type: "ConstructionSite", preview: true }
    ],
    docs: {
      summary: "Order a creep to build a construction site, repairing when configured.",
      usage:
        "Attach a construction site target. The optional repair threshold lets the creep repair the structure once built until the percentage is reached.",
      inputs:
        "- **Creep:** Builder executing the action.\n- **Site:** Construction site or structure to maintain.",
      notes: "Combines naturally with Find → Sort nodes to prioritize sites."
    },
    codegen: { emitter: "creep" }
  },
  "creep.attack": {
    kind: "creep.attack",
    title: "Attack",
    acronym: "AT",
    icon: "attack",
    family: "creep",
    category: "Creep Actions",
    color: CREEP_COLOR,
    ports: [
      { id: "input:creep", side: "input", label: "Creep", icon: "creep", type: "Creep" },
      { id: "input:target", side: "input", label: "Target", icon: "attack", type: "Creep | Structure", preview: true }
    ],
    docs: {
      summary: "Attack a hostile creep or structure with melee or ranged style.",
      usage:
        "Connect the hostile target and choose melee or ranged mode in the configuration. Combine with Move to chase enemies.",
      inputs:
        "- **Creep:** Attacker performing the strike.\n- **Target:** Hostile creep or structure.",
      notes: "Automatically chooses ranged attack when equipped with ranged body parts and configured for ranged mode."
    },
    codegen: { emitter: "creep" }
  }
};
