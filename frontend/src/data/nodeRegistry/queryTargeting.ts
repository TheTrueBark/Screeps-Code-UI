import type { NodeMeta } from "./schema";

const QUERY_COLOR = "#facc15";

/**
 * Query & Targeting nodes map to Screeps search utilities for finding objects.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Screeps Room.find helper. Docs: https://docs.screeps.com/api/#Room.find
   */
  "query.find": {
    kind: "query.find",
    title: "Find / Room.find",
    acronym: "FD",
    icon: "search",
    family: "queryTargeting",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "findConstant",
        label: "FIND_* constant",
        type: "enum",
        default: "FIND_SOURCES",
        description:
          "Default Screeps constant used when no input overrides are connected.",
        options: [
          { value: "FIND_SOURCES", label: "FIND_SOURCES" },
          { value: "FIND_STRUCTURES", label: "FIND_STRUCTURES" },
          { value: "FIND_HOSTILE_CREEPS", label: "FIND_HOSTILE_CREEPS" },
        ],
      },
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "first",
        description:
          "Choose whether to return the first match or the entire list of results.",
        options: [
          { value: "first", label: "First" },
          { value: "all", label: "All" },
        ],
      },
      {
        key: "roomScope",
        label: "Room scope",
        type: "enum",
        default: "current",
        description:
          "Determine whether the query uses the executing creep's room or a named room.",
        options: [
          { value: "current", label: "Current room" },
          { value: "name", label: "Named room" },
        ],
      },
      {
        key: "roomName",
        label: "Room name",
        type: "string",
        default: "",
        description: "Specific room to query when scope is set to named room.",
        placeholder: "W0N0",
      },
      {
        key: "filters",
        label: "Filters",
        type: "list",
        default: [],
        description:
          "Array of { field, op, value } predicates applied to each found object.",
      },
      {
        key: "limit",
        label: "Limit",
        type: "number",
        default: 1,
        description: "Maximum number of results returned in list mode.",
      },
    ],
    defaultInputs: [
      {
        id: "input:room",
        label: "Room",
        type: "Room",
        description:
          "Optional room object overriding the configured room scope when provided.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "RoomObject | RoomObject[]",
        description:
          "Single object or array depending on the selected mode and limit.",
      },
    ],
    editableExtensions: [
      {
        key: "sort",
        label: "Sort strategy",
        type: "enum",
        default: "closestByRange",
        description:
          "Apply Screeps helper sorting like closestByRange or closestByPath to the results.",
        options: [
          { value: "closestByRange", label: "closestByRange" },
          { value: "closestByPath", label: "closestByPath" },
          { value: "highestEnergy", label: "Highest energy" },
        ],
        advanced: true,
      },
      {
        key: "customFilter",
        label: "Custom filter expression",
        type: "expression",
        default: "true",
        description:
          "Inline predicate invoked for each candidate when advanced filtering is required.",
        advanced: true,
      },
      {
        key: "costMatrix",
        label: "Cost matrix input",
        type: "boolean",
        default: false,
        description:
          "Accept an optional CostMatrix data input to influence path-based find operations.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:room",
        side: "input",
        label: "Room",
        type: "room",
        icon: "search",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        type: "object",
        icon: "search",
      },
    ],
    docs: {
      summary:
        "Find Screeps objects using Room.find with configurable constants and filters.",
      usage:
        "Select a FIND_* constant, optionally scope to a specific room, and connect the result to downstream decision nodes.",
      inputs:
        "- **Room:** Optional room override when querying remote locations.",
      outputs:
        "- **Result:** RoomObject or array depending on mode. Always undefined when nothing matches.",
      notes:
        "Advanced filtering and sorting options can be toggled via the extensions panel to replicate common Screeps patterns.",
    },
    codegen: { emitter: "query" },
  },
  /**
   * Game.getObjectById helper. Docs: https://docs.screeps.com/api/#Game.getObjectById
   */
  "query.resolveById": {
    kind: "query.resolveById",
    title: "Resolve ID",
    acronym: "ID",
    icon: "id",
    family: "queryTargeting",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "id",
        label: "Object ID",
        type: "string",
        default: "",
        description:
          "String identifier retrieved from Game.getObjectById or stored in Memory.",
        placeholder: "5bbcaf1d9099fc012e63a0a1",
      },
    ],
    defaultInputs: [
      {
        id: "input:id",
        label: "ID",
        type: "string",
        description: "Optional wired ID overriding the default configuration.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Object",
        type: "RoomObject | null",
        description:
          "Resolved game object or null when not found or out of vision.",
      },
    ],
    editableExtensions: [
      {
        key: "fallback",
        label: "Fallback value",
        type: "expression",
        default: "null",
        description: "Expression returned when the id cannot be resolved.",
      },
      {
        key: "errorBranch",
        label: "Error branch",
        type: "boolean",
        default: false,
        description:
          "Expose an optional flow output triggered when resolution fails (planned).",
        advanced: true,
      },
      {
        key: "castType",
        label: "Auto-cast type",
        type: "enum",
        default: "auto",
        description:
          "Hint the expected object type to help downstream nodes (creep, structure, resource, etc.).",
        options: [
          { value: "auto", label: "Auto" },
          { value: "creep", label: "Creep" },
          { value: "structure", label: "Structure" },
          { value: "flag", label: "Flag" },
        ],
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:id",
        side: "input",
        label: "ID",
        icon: "id",
        type: "string",
        preview: true,
      },
      {
        id: "data:result",
        side: "output",
        label: "Object",
        icon: "id",
        type: "object",
      },
    ],
    docs: {
      summary: "Resolve a game object by its persistent identifier.",
      usage:
        "Provide the ID via config or input. Downstream nodes can branch on whether the result is null to handle stale references.",
      inputs: "- **ID:** String identifier from Game.getObjectById.",
      outputs:
        "- **Object:** Resolved RoomObject instance or null when missing.",
      notes:
        "Only visible objects can be resolved each tick. Consider fallback values for remote targets.",
    },
    codegen: { emitter: "query" },
  },
  /**
   * Terrain and object inspection. Docs: https://docs.screeps.com/api/#Room.lookForAt
   */
  "query.neighborhood": {
    kind: "query.neighborhood",
    title: "Neighborhood / Look",
    acronym: "LK",
    icon: "radar",
    family: "queryTargeting",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "mode",
        label: "Look mode",
        type: "enum",
        default: "lookAt",
        description: "Select the Room.look* variant to execute.",
        options: [
          { value: "lookAt", label: "lookAt" },
          { value: "lookFor", label: "lookFor" },
          { value: "lookAtArea", label: "lookAtArea" },
          { value: "lookForAtArea", label: "lookForAtArea" },
        ],
      },
      {
        key: "type",
        label: "LOOK_* constant",
        type: "enum",
        default: "LOOK_STRUCTURES",
        description: "Type of results to retrieve when using lookFor variants.",
        options: [
          { value: "LOOK_STRUCTURES", label: "LOOK_STRUCTURES" },
          { value: "LOOK_TERRAIN", label: "LOOK_TERRAIN" },
          { value: "LOOK_ENERGY", label: "LOOK_ENERGY" },
        ],
      },
      {
        key: "radius",
        label: "Radius",
        type: "number",
        default: 1,
        description: "Radius around the provided position for area lookups.",
      },
    ],
    defaultInputs: [
      {
        id: "input:pos",
        label: "Position",
        type: "RoomPosition",
        description: "Center location to inspect.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:results",
        label: "Results",
        type: "LookResult[]",
        description:
          "Array of look results matching the configured mode and type.",
      },
    ],
    editableExtensions: [
      {
        key: "distanceFilter",
        label: "Distance filter",
        type: "number",
        default: 0,
        description:
          "Ignore results beyond the specified range from the center position.",
        advanced: true,
      },
      {
        key: "flatten",
        label: "Flatten results",
        type: "boolean",
        default: true,
        description:
          "Return only the matched game objects instead of verbose look result entries.",
      },
      {
        key: "excludeSelf",
        label: "Exclude origin",
        type: "boolean",
        default: false,
        description:
          "Skip results that reference the origin object, useful for creep self checks.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:pos",
        side: "input",
        label: "Position",
        icon: "radar",
        type: "position",
      },
      {
        id: "data:results",
        side: "output",
        label: "Results",
        icon: "radar",
        type: "array",
      },
    ],
    docs: {
      summary:
        "Inspect terrain or objects near a RoomPosition using look helpers.",
      usage:
        "Connect a RoomPosition or creep.pos to probe the surrounding tiles. Configure mode and look constant to control the output.",
      inputs: "- **Position:** RoomPosition to inspect.",
      outputs:
        "- **Results:** Array of look results or objects, depending on flatten option.",
      notes:
        "Area lookups return nested coordinate dictionaries when flatten is disabled.",
    },
    codegen: { emitter: "query" },
  },
  /**
   * Selection utilities. Docs: https://docs.screeps.com/api/#RoomPosition.findClosestByRange
   */
  "query.sortBest": {
    kind: "query.sortBest",
    title: "Sort / Best",
    acronym: "SB",
    icon: "target",
    family: "queryTargeting",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "strategy",
        label: "Strategy",
        type: "enum",
        default: "closestByPath",
        description: "Primary selection algorithm for ranking candidates.",
        options: [
          { value: "closestByPath", label: "Closest by path" },
          { value: "closestByRange", label: "Closest by range" },
          { value: "highest", label: "Highest property" },
        ],
      },
      {
        key: "property",
        label: "Property",
        type: "string",
        default: "energy",
        description:
          "Object property to evaluate when using highest/lowest property strategies.",
      },
    ],
    defaultInputs: [
      {
        id: "input:list",
        label: "List",
        type: "Array",
        description: "Candidate list to rank or filter.",
      },
      {
        id: "input:origin",
        label: "Origin",
        type: "RoomPosition | Creep",
        description:
          "Reference position or creep when calculating distance-based strategies.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:best",
        label: "Best",
        type: "any",
        description: "Top-ranked candidate based on strategy.",
      },
    ],
    editableExtensions: [
      {
        key: "topN",
        label: "Top N",
        type: "number",
        default: 1,
        description:
          "Return an array containing the top N candidates instead of a single best value.",
        advanced: true,
      },
      {
        key: "comparator",
        label: "Custom comparator",
        type: "expression",
        default: "(a, b) => b.energy - a.energy",
        description:
          "Provide a comparator function to override built-in strategies.",
        advanced: true,
      },
      {
        key: "tiebreaker",
        label: "Tie-breaker",
        type: "enum",
        default: "random",
        description: "How to resolve ties between candidates with equal score.",
        options: [
          { value: "random", label: "Random" },
          { value: "first", label: "First" },
          { value: "lowestId", label: "Lowest ID" },
        ],
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:list",
        side: "input",
        label: "List",
        icon: "target",
        type: "array",
      },
      {
        id: "input:origin",
        side: "input",
        label: "Origin",
        icon: "target",
        type: "object",
      },
      {
        id: "data:best",
        side: "output",
        label: "Best",
        icon: "target",
        type: "object",
      },
    ],
    docs: {
      summary:
        "Rank or select the best target from a candidate list using Screeps heuristics.",
      usage:
        "Wire in results from Find or Look nodes, choose a ranking strategy, and forward the best target to action nodes.",
      inputs:
        "- **List:** Candidates to evaluate.\n- **Origin:** Optional position reference for distance calculations.",
      outputs: "- **Best:** Selected candidate or array when Top N > 1.",
      notes: "Custom comparator expressions enable advanced scoring pipelines.",
    },
    codegen: { emitter: "query" },
  },
  /**
   * Pathfinding helper. Docs: https://docs.screeps.com/api/#PathFinder.search
   */
  "query.pathfind": {
    kind: "query.pathfind",
    title: "Pathfinder",
    acronym: "PF",
    icon: "path",
    family: "queryTargeting",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "range",
        label: "Goal range",
        type: "number",
        default: 1,
        description:
          "Acceptable range from the target at which the path terminates.",
      },
      {
        key: "maxOps",
        label: "Max ops",
        type: "number",
        default: 2000,
        description: "Maximum search operations passed to PathFinder.search.",
      },
    ],
    defaultInputs: [
      {
        id: "input:origin",
        label: "Origin",
        type: "RoomPosition",
        description: "Starting position for the path search.",
      },
      {
        id: "input:goal",
        label: "Goal",
        type: "RoomPosition | RoomPosition[]",
        description: "Single or multiple goals for the path search.",
      },
      {
        id: "input:cost",
        label: "Cost matrix",
        type: "CostMatrix",
        description: "Optional terrain cost matrix influencing the search.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "data:path",
        label: "Path",
        type: "PathStep[]",
        description: "Computed path steps from origin to goal.",
      },
      {
        id: "data:incomplete",
        label: "Incomplete",
        type: "boolean",
        description:
          "Indicates whether the search exited early due to cost or ops limits.",
      },
    ],
    editableExtensions: [
      {
        key: "reusePath",
        label: "Reuse path",
        type: "number",
        default: 5,
        description:
          "Cache path for the specified number of ticks when combined with creep.move.",
      },
      {
        key: "heuristicWeight",
        label: "Heuristic weight",
        type: "number",
        default: 1.2,
        description:
          "Adjust PathFinder heuristic weight for performance vs accuracy.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:origin",
        side: "input",
        label: "Origin",
        icon: "path",
        type: "position",
      },
      {
        id: "input:goal",
        side: "input",
        label: "Goal",
        icon: "path",
        type: "position",
      },
      {
        id: "input:cost",
        side: "input",
        label: "Cost",
        icon: "path",
        type: "matrix",
      },
      {
        id: "data:path",
        side: "output",
        label: "Path",
        icon: "path",
        type: "array",
      },
      {
        id: "data:incomplete",
        side: "output",
        label: "Incomplete",
        icon: "path",
        type: "boolean",
      },
    ],
    docs: {
      summary:
        "Compute optimized paths between positions using PathFinder.search.",
      usage:
        "Connect origin and goal RoomPositions. Configure limits and reuse to balance CPU and accuracy.",
      inputs:
        "- **Origin:** Starting position.\n- **Goal:** Target position or positions.\n- **Cost:** Optional CostMatrix for terrain weighting.",
      outputs:
        "- **Path:** Array of path steps.\n- **Incomplete:** Boolean flag set when the search could not reach the goal within limits.",
      notes:
        "Exposed as a planned node; enable once path visualizer support lands.",
    },
    codegen: { emitter: "query" },
  },
};
