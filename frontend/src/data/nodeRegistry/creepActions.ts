import type { NodeMeta } from "./schema";

const CREEP_COLOR = "#7dd3fc";

/**
 * Creep action nodes map to Creep prototype methods and combat utilities.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Creep.move wrapper. Docs: https://docs.screeps.com/api/#Creep.move
   */
  "creep.move": {
    kind: "creep.move",
    title: "Move",
    acronym: "MV",
    icon: "move",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "adapter",
        label: "Adapter",
        type: "enum",
        default: "auto",
        description:
          "Select the movement helper to use (auto chooses between path reuse and direct move).",
        options: [
          { value: "auto", label: "Auto" },
          { value: "moveTo", label: "creep.moveTo" },
          { value: "path", label: "Cached path" },
        ],
      },
      {
        key: "range",
        label: "Range",
        type: "number",
        default: 1,
        description: "Desired stopping range from the target position.",
      },
      {
        key: "reusePath",
        label: "Reuse path",
        type: "number",
        default: 5,
        description:
          "Ticks to reuse cached path segments when using moveTo adapter.",
      },
      {
        key: "flee",
        label: "Flee",
        type: "boolean",
        default: false,
        description:
          "Invert goal range to flee from the target instead of moving toward it.",
      },
      {
        key: "avoidHostiles",
        label: "Avoid hostiles",
        type: "boolean",
        default: true,
        description:
          "Automatically adjust cost matrix to avoid hostile creeps.",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:targetPos",
        label: "Target position",
        type: "RoomPosition",
        description: "Destination for the creep.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description:
          "Return code from the move operation (OK, ERR_NO_PATH, etc.).",
      },
    ],
    editableExtensions: [
      {
        key: "costMatrix",
        label: "Cost matrix",
        type: "boolean",
        default: false,
        description:
          "Expose an additional data input for supplying a custom PathFinder.CostMatrix.",
        advanced: true,
      },
      {
        key: "timeout",
        label: "Timeout",
        type: "number",
        default: 25,
        description:
          "Abort the move after N ticks and surface a failure code to upstream logic.",
        advanced: true,
      },
      {
        key: "stuckDetection",
        label: "Stuck detection",
        type: "boolean",
        default: true,
        description:
          "Enable heuristics to detect when the creep is not progressing and trigger replanning.",
        advanced: true,
      },
      {
        key: "priority",
        label: "Move priority",
        type: "enum",
        default: "normal",
        description:
          "Scheduling priority used by macro task runners when multiple moves compete.",
        options: [
          { value: "normal", label: "Normal" },
          { value: "urgent", label: "Urgent" },
          { value: "low", label: "Low" },
        ],
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:targetPos",
        side: "input",
        label: "Target",
        icon: "move",
        type: "position",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "move",
        type: "number",
      },
    ],
    docs: {
      summary: "Issue creep movement toward or away from a target position.",
      usage:
        "Wire a RoomPosition into Target position and optionally override the creep input. Configure path reuse and avoidance heuristics in the side panel.",
      inputs:
        "- **Creep:** Actor performing the move.\n- **Target position:** Destination RoomPosition.",
      outputs: "- **Result:** Numeric Screeps return code from the move call.",
      notes:
        "Advanced extensions provide CPU-aware optimisations such as custom cost matrices and stuck detection.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.harvest wrapper. Docs: https://docs.screeps.com/api/#Creep.harvest
   */
  "creep.harvest": {
    kind: "creep.harvest",
    title: "Harvest",
    acronym: "HV",
    icon: "harvest",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "fallback",
        label: "Fallback",
        type: "enum",
        default: "move",
        description: "Behavior when out of range of the source.",
        options: [
          { value: "move", label: "Move closer" },
          { value: "none", label: "None" },
        ],
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        optional: true,
        description: "Optional creep override.",
      },
      {
        id: "input:source",
        label: "Source",
        type: "Source | Mineral",
        description: "Target resource node to harvest.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from creep.harvest.",
      },
    ],
    editableExtensions: [
      {
        key: "minEnergy",
        label: "Min energy threshold",
        type: "number",
        default: 0,
        description:
          "Skip harvesting when the source energy is below this value.",
        advanced: true,
      },
      {
        key: "remote",
        label: "Remote flag",
        type: "boolean",
        default: false,
        description:
          "Mark the action as remote to integrate with remote-harvest macros.",
        advanced: true,
      },
      {
        key: "priorityCluster",
        label: "Priority cluster",
        type: "string",
        default: "harvest",
        description:
          "Group identifier used by scheduling systems to balance worker allocation.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:source",
        side: "input",
        label: "Source",
        icon: "harvest",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "harvest",
        type: "number",
      },
    ],
    docs: {
      summary: "Harvest energy or minerals from a source structure.",
      usage:
        "Provide the target source and optionally the executing creep. Configure fallback movement to approach the source when out of range.",
      inputs:
        "- **Creep:** Worker performing the harvest.\n- **Source:** Source or mineral to target.",
      outputs: "- **Result:** Screeps return code from harvest.",
      notes:
        "Threshold and remote options integrate with advanced resource managers.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.transfer wrapper. Docs: https://docs.screeps.com/api/#Creep.transfer
   */
  "creep.transfer": {
    kind: "creep.transfer",
    title: "Transfer",
    acronym: "TF",
    icon: "transfer",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "resource",
        label: "Resource",
        type: "string",
        default: "RESOURCE_ENERGY",
        description:
          "Resource type to transfer when no input overrides are wired.",
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        default: 0,
        description:
          "Amount to transfer. Zero uses the maximum possible (creep store or target capacity).",
      },
      {
        key: "fallback",
        label: "Fallback",
        type: "enum",
        default: "move",
        description: "Behavior when out of range of the target.",
        options: [
          { value: "move", label: "Move closer" },
          { value: "drop", label: "Drop resource" },
          { value: "none", label: "None" },
        ],
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        optional: true,
        description: "Optional creep override.",
      },
      {
        id: "input:target",
        label: "Target",
        type: "Structure | Creep",
        description: "Destination for the resource transfer.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from creep.transfer.",
      },
    ],
    editableExtensions: [
      {
        key: "dropThreshold",
        label: "Drop threshold",
        type: "number",
        default: 0,
        description:
          "Automatically drop resource when amount left is below this threshold.",
        advanced: true,
      },
      {
        key: "retry",
        label: "Retry attempts",
        type: "number",
        default: 1,
        description: "Number of retries before giving up when transfer fails.",
        advanced: true,
      },
      {
        key: "partial",
        label: "Allow partial",
        type: "boolean",
        default: true,
        description:
          "Permit partial transfers when the target cannot hold the full amount.",
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:target",
        side: "input",
        label: "Target",
        icon: "transfer",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "transfer",
        type: "number",
      },
    ],
    docs: {
      summary: "Transfer resources from a creep to another creep or structure.",
      usage:
        "Provide a target object and configure resource/amount. Fallback options control movement or dropping behavior when out of range.",
      inputs:
        "- **Creep:** Actor performing the transfer.\n- **Target:** Structure or creep receiving the resource.",
      outputs: "- **Result:** Screeps return code.",
      notes: "Partial transfer logic enables more flexible store balancing.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.withdraw wrapper. Docs: https://docs.screeps.com/api/#Creep.withdraw
   */
  "creep.withdraw": {
    kind: "creep.withdraw",
    title: "Withdraw",
    acronym: "WD",
    icon: "withdraw",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "resource",
        label: "Resource",
        type: "string",
        default: "RESOURCE_ENERGY",
        description: "Resource type to withdraw.",
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        default: 0,
        description: "Amount to withdraw (0 fetches as much as possible).",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:target",
        label: "Target",
        type: "Structure | Tombstone | Ruin",
        description: "Object to withdraw from.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from creep.withdraw.",
      },
    ],
    editableExtensions: [
      {
        key: "fallbackTransfer",
        label: "Fallback transfer",
        type: "boolean",
        default: false,
        description:
          "Attempt to transfer to a backup structure when withdrawal fails due to full store.",
        advanced: true,
      },
      {
        key: "minAmount",
        label: "Minimum amount",
        type: "number",
        default: 0,
        description:
          "Abort the action if less than the specified amount is available.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:target",
        side: "input",
        label: "Target",
        icon: "withdraw",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "withdraw",
        type: "number",
      },
    ],
    docs: {
      summary: "Withdraw resources from structures, tombstones, or ruins.",
      usage:
        "Connect the target container and configure resource details. Combine with transfer nodes for hauling chains.",
      inputs:
        "- **Creep:** Actor performing the withdrawal.\n- **Target:** Resource container or tombstone.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Fallback transfer can automatically redirect overflow to another structure.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.build wrapper. Docs: https://docs.screeps.com/api/#Creep.build
   */
  "creep.build": {
    kind: "creep.build",
    title: "Build",
    acronym: "BD",
    icon: "build",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "repairThreshold",
        label: "Repair threshold",
        type: "number",
        default: 0,
        description:
          "When targeting construction sites, optionally repair structures below this hits percentage before building.",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:site",
        label: "Construction",
        type: "ConstructionSite",
        description: "Site to build or structure to repair.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from build or repair call.",
      },
    ],
    editableExtensions: [
      {
        key: "maxParts",
        label: "Max work parts",
        type: "number",
        default: 0,
        description:
          "Limit effective WORK part usage for staged building or resource budgeting.",
        advanced: true,
      },
      {
        key: "fallbackAction",
        label: "Fallback action",
        type: "enum",
        default: "idle",
        description:
          "Action to perform when no valid construction site exists.",
        options: [
          { value: "idle", label: "Idle" },
          { value: "repair", label: "Repair" },
          { value: "upgrade", label: "Upgrade controller" },
        ],
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:site",
        side: "input",
        label: "Construction",
        icon: "build",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "build",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Direct a creep to build construction sites or repair structures.",
      usage:
        "Wire in the construction site or damaged structure. Configure fallback actions to keep the creep productive when the site completes.",
      inputs:
        "- **Creep:** Worker performing the build.\n- **Construction:** Site or structure target.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Threshold configuration determines when repair occurs before building.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.repair wrapper. Docs: https://docs.screeps.com/api/#Creep.repair
   */
  "creep.repair": {
    kind: "creep.repair",
    title: "Repair",
    acronym: "RP",
    icon: "repair",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "targetHits",
        label: "Target hits",
        type: "number",
        default: 50000,
        description: "Stop repairing when structure hits reach this value.",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:structure",
        label: "Structure",
        type: "Structure",
        description: "Structure to repair.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from repair.",
      },
    ],
    editableExtensions: [
      {
        key: "fallback",
        label: "Fallback",
        type: "enum",
        default: "upgrade",
        description: "Action when the structure is fully repaired.",
        options: [
          { value: "upgrade", label: "Upgrade controller" },
          { value: "build", label: "Build nearby" },
          { value: "idle", label: "Idle" },
        ],
      },
      {
        key: "priority",
        label: "Priority",
        type: "string",
        default: "defense",
        description: "Tag used by macro managers to cluster repair jobs.",
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:structure",
        side: "input",
        label: "Structure",
        icon: "repair",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "repair",
        type: "number",
      },
    ],
    docs: {
      summary: "Repair damaged structures using stored energy.",
      usage:
        "Provide the target structure and configure repair threshold. Fallback actions keep builders useful when the job completes.",
      inputs:
        "- **Creep:** Worker performing repairs.\n- **Structure:** Structure to fix.",
      outputs: "- **Result:** Screeps return code.",
      notes: "Target hits threshold prevents over-repairing walls or ramparts.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.upgradeController wrapper. Docs: https://docs.screeps.com/api/#Creep.upgradeController
   */
  "creep.upgrade": {
    kind: "creep.upgrade",
    title: "Upgrade Controller",
    acronym: "UP",
    icon: "upgrade",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "useBoosts",
        label: "Use boosts",
        type: "boolean",
        default: false,
        description:
          "Whether to consume upgrade boosts from labs or power creeps.",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:controller",
        label: "Controller",
        type: "StructureController",
        description: "Controller to upgrade (defaults to room controller).",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from upgradeController.",
      },
    ],
    editableExtensions: [
      {
        key: "minEnergy",
        label: "Minimum energy",
        type: "number",
        default: 0,
        description:
          "Hold energy until creep store exceeds this value before upgrading.",
        advanced: true,
      },
      {
        key: "reserveBuffer",
        label: "Reserve buffer",
        type: "number",
        default: 0,
        description:
          "Energy amount to keep in storage containers before committing to upgrade.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:controller",
        side: "input",
        label: "Controller",
        icon: "upgrade",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "upgrade",
        type: "number",
      },
    ],
    docs: {
      summary: "Upgrade room controllers using stored energy.",
      usage:
        "Connect a controller or allow the node to default to the room's controller. Configure energy guards and boost usage via extensions.",
      inputs:
        "- **Creep:** Upgrader creep.\n- **Controller:** Target controller (optional).",
      outputs: "- **Result:** Screeps return code.",
      notes: "Reserve buffer helps maintain emergency energy reserves.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.attack and Creep.rangedAttack wrapper. Docs: https://docs.screeps.com/api/#Creep.attack
   */
  "creep.attack": {
    kind: "creep.attack",
    title: "Attack / RangedAttack",
    acronym: "AT",
    icon: "attack",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "melee",
        description: "Use melee attack() or rangedAttack().",
        options: [
          { value: "melee", label: "Melee" },
          { value: "ranged", label: "Ranged" },
        ],
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:target",
        label: "Target",
        type: "Creep | Structure",
        description: "Enemy object to attack.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from attack/rangedAttack.",
      },
    ],
    editableExtensions: [
      {
        key: "noSwap",
        label: "No swap",
        type: "boolean",
        default: true,
        description:
          "Prevent path planners from swapping creeps when the target occupies the destination.",
        advanced: true,
      },
      {
        key: "priorityList",
        label: "Priority list",
        type: "list",
        default: [],
        description:
          "Ordered list of structure/creep types to target when multiple enemies are in range.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:target",
        side: "input",
        label: "Target",
        icon: "attack",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "attack",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Perform melee or ranged attacks against hostile creeps or structures.",
      usage:
        "Wire enemy targets from query nodes. Configure mode to choose attack type and optional priority lists for autopilot behaviors.",
      inputs:
        "- **Creep:** Combat unit.\n- **Target:** Enemy creep or structure.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "No-swap prevents move-to-target heuristics from exchanging positions mid-combat.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Creep.heal wrapper. Docs: https://docs.screeps.com/api/#Creep.heal
   */
  "creep.heal": {
    kind: "creep.heal",
    title: "Heal / RangedHeal",
    acronym: "HL",
    icon: "heal",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "melee",
        description: "Use heal() or rangedHeal().",
        options: [
          { value: "melee", label: "Melee" },
          { value: "ranged", label: "Ranged" },
        ],
      },
      {
        key: "threshold",
        label: "Heal threshold",
        type: "number",
        default: 0.75,
        description: "Heal targets whose hits ratio falls below this value.",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Optional creep reference overriding implicit context.",
        optional: true,
      },
      {
        id: "input:target",
        label: "Target",
        type: "Creep",
        description: "Friendly creep to heal.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from heal/rangedHeal.",
      },
    ],
    editableExtensions: [
      {
        key: "fallbackRepair",
        label: "Fallback repair",
        type: "boolean",
        default: false,
        description:
          "When no healing is required, repair nearby ramparts or walls.",
        advanced: true,
      },
      {
        key: "priorityQueue",
        label: "Priority queue",
        type: "list",
        default: [],
        description: "Ordered list of target IDs or roles to heal first.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "creep",
        type: "object",
      },
      {
        id: "input:target",
        side: "input",
        label: "Target",
        icon: "heal",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "heal",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Heal or ranged-heal friendly creeps based on configurable thresholds.",
      usage:
        "Provide a friendly target and adjust the heal threshold to tune triage behavior. Optional fallback repair keeps medics productive.",
      inputs:
        "- **Creep:** Medic unit.\n- **Target:** Friendly creep in need of healing.",
      outputs: "- **Result:** Screeps return code.",
      notes: "Priority queues allow routing heal events across squads.",
    },
    codegen: { emitter: "creep" },
  },
  /**
   * Claim controller macro. Docs: https://docs.screeps.com/api/#Creep.claimController
   */
  "creep.claim": {
    kind: "creep.claim",
    title: "Claim Controller",
    acronym: "CL",
    icon: "claim",
    family: "creepActions",
    category: "Creep Actions",
    color: CREEP_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "reserve",
        label: "Reserve instead",
        type: "boolean",
        default: false,
        description: "Reserve the controller instead of claiming outright.",
      },
    ],
    defaultInputs: [
      {
        id: "input:creep",
        label: "Creep",
        type: "Creep",
        description: "Creep performing the claim or reserve action.",
      },
      {
        id: "input:controller",
        label: "Controller",
        type: "StructureController",
        description: "Controller structure to claim or reserve.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from claim/reserve controller.",
      },
    ],
    editableExtensions: [
      {
        key: "signText",
        label: "Sign text",
        type: "string",
        default: "",
        description: "Optional controller sign applied after claim succeeds.",
      },
    ],
    ports: [
      {
        id: "input:creep",
        side: "input",
        label: "Creep",
        icon: "claim",
        type: "object",
      },
      {
        id: "input:controller",
        side: "input",
        label: "Controller",
        icon: "claim",
        type: "object",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "claim",
        type: "number",
      },
    ],
    docs: {
      summary: "Plan to claim or reserve controllers in remote rooms.",
      usage:
        "Connect a pioneer creep and remote controller. Configure reserve mode for temporary control.",
      inputs:
        "- **Creep:** Pioneer creep.\n- **Controller:** Remote controller target.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Marked as planned pending macro integration and inter-shard safeguards.",
    },
    codegen: { emitter: "creep" },
  },
};
