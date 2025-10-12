import type { NodeMeta } from "./schema";

const MAP_COLOR = "#60a5fa";

/**
 * Map / Navigation nodes work with RoomPosition, map analysis, and routing.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Construct RoomPosition objects. Docs: https://docs.screeps.com/api/#RoomPosition
   */
  "map.roomPosition": {
    kind: "map.roomPosition",
    title: "Room Position",
    acronym: "RP",
    icon: "map",
    family: "mapNavigation",
    category: "Map / Room / Position / Navigation",
    color: MAP_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "x",
        label: "X",
        type: "number",
        default: 25,
        description: "X coordinate within the room (0-49).",
      },
      {
        key: "y",
        label: "Y",
        type: "number",
        default: 25,
        description: "Y coordinate within the room (0-49).",
      },
      {
        key: "roomName",
        label: "Room name",
        type: "string",
        default: "W0N0",
        description: "Room identifier for the position.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:pos",
        label: "Position",
        type: "RoomPosition",
        description: "Constructed RoomPosition instance.",
      },
    ],
    editableExtensions: [
      {
        key: "clamp",
        label: "Clamp coordinates",
        type: "boolean",
        default: true,
        description: "Automatically clamp values to valid room bounds.",
      },
    ],
    ports: [
      {
        id: "data:pos",
        side: "output",
        label: "Position",
        icon: "map",
        type: "position",
      },
    ],
    docs: {
      summary: "Create RoomPosition objects for navigation and pathfinding.",
      usage:
        "Set coordinates and room name or wire them from upstream calculations. Useful for lookups, pathfinding, and queries.",
      outputs: "- **Position:** RoomPosition object.",
      notes:
        "Coordinate clamping guards against invalid values during procedural generation.",
    },
    codegen: { emitter: "map" },
  },
  /**
   * Find exits between rooms. Docs: https://docs.screeps.com/api/#Game.map.describeExits
   */
  "map.describeExits": {
    kind: "map.describeExits",
    title: "Describe Exits",
    acronym: "EX",
    icon: "map",
    family: "mapNavigation",
    category: "Map / Room / Position / Navigation",
    color: MAP_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "roomName",
        label: "Room",
        type: "string",
        default: "W0N0",
        description: "Room to inspect for exits.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:exits",
        label: "Exits",
        type: "Record<ExitKey, string | undefined>",
        description: "Map of exit directions to neighbouring room names.",
      },
    ],
    editableExtensions: [
      {
        key: "includePortals",
        label: "Include portals",
        type: "boolean",
        default: false,
        description: "Include inter-shard portals when available.",
      },
    ],
    ports: [
      {
        id: "data:exits",
        side: "output",
        label: "Exits",
        icon: "map",
        type: "object",
      },
    ],
    docs: {
      summary:
        "Retrieve neighbouring rooms and exit directions for a given room.",
      usage:
        "Use to plan scouting, highway travel, or remote logistics. Combine with findRoute for deeper navigation.",
      outputs:
        "- **Exits:** Mapping of exit direction constants to room names.",
      notes: "Portal inclusion is optional for cross-shard planning.",
    },
    codegen: { emitter: "map" },
  },
  /**
   * Find route between rooms. Docs: https://docs.screeps.com/api/#Game.map.findRoute
   */
  "map.findRoute": {
    kind: "map.findRoute",
    title: "Find Route",
    acronym: "FR",
    icon: "map",
    family: "mapNavigation",
    category: "Map / Room / Position / Navigation",
    color: MAP_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "from",
        label: "From room",
        type: "string",
        default: "W0N0",
        description: "Starting room.",
      },
      {
        key: "to",
        label: "To room",
        type: "string",
        default: "W5N5",
        description: "Destination room.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:route",
        label: "Route",
        type: "Array<{ exit: ExitConstant; room: string }>",
        description: "Array describing the room-to-room path.",
      },
    ],
    editableExtensions: [
      {
        key: "routeCallback",
        label: "Route callback",
        type: "boolean",
        default: false,
        description:
          "Enable a custom callback for weighting room travel costs.",
      },
      {
        key: "avoidRooms",
        label: "Avoid rooms",
        type: "list",
        default: [],
        description: "List of rooms to avoid while routing.",
      },
    ],
    ports: [
      {
        id: "data:route",
        side: "output",
        label: "Route",
        icon: "map",
        type: "array",
      },
    ],
    docs: {
      summary: "Compute inter-room routes using Game.map.findRoute.",
      usage:
        "Specify origin and destination rooms. Configure avoidance or custom callbacks to integrate with territorial strategies.",
      outputs:
        "- **Route:** Array describing exit directions and intermediate rooms.",
      notes: "Supports future integration with visual route planning overlays.",
    },
    codegen: { emitter: "map" },
  },
  /**
   * Cost matrix builder. Docs: https://docs.screeps.com/api/#PathFinder.CostMatrix
   */
  "map.costMatrix": {
    kind: "map.costMatrix",
    title: "Cost Matrix",
    acronym: "CM",
    icon: "map",
    family: "mapNavigation",
    category: "Map / Room / Position / Navigation",
    color: MAP_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "defaults",
        label: "Default cost",
        type: "number",
        default: 1,
        description: "Base cost assigned to tiles when not overridden.",
      },
    ],
    defaultInputs: [
      {
        id: "input:weights",
        label: "Weights",
        type: "Array<{ pos: RoomPosition; cost: number }>",
        optional: true,
        description: "Manual cost overrides for specific positions.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:matrix",
        label: "Matrix",
        type: "CostMatrix",
        description: "Constructed PathFinder cost matrix.",
      },
    ],
    editableExtensions: [
      {
        key: "visualize",
        label: "Visualize",
        type: "boolean",
        default: false,
        description: "Render the cost matrix using RoomVisual for debugging.",
      },
    ],
    ports: [
      {
        id: "input:weights",
        side: "input",
        label: "Weights",
        icon: "map",
        type: "array",
      },
      {
        id: "data:matrix",
        side: "output",
        label: "Matrix",
        icon: "map",
        type: "object",
      },
    ],
    docs: {
      summary: "Assemble CostMatrix objects for pathfinding customization.",
      usage:
        "Supply override weights or leave empty for default initialization. Visualize to inspect path costs during tuning.",
      inputs: "- **Weights:** Array of position/cost overrides (optional).",
      outputs: "- **Matrix:** PathFinder cost matrix instance.",
      notes:
        "Intended for advanced navigation setups; planned for future code generation hooks.",
    },
    codegen: { emitter: "map" },
  },
};
