import type { NodeMeta } from "./schema";

const QUERY_COLOR = "#facc15";

export const nodes: Record<string, NodeMeta> = {
  "query.find": {
    kind: "query.find",
    title: "Find",
    acronym: "FI",
    icon: "target",
    family: "query",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    ports: [
      { id: "input:room", side: "input", label: "Room", icon: "target", type: "Room" },
      { id: "data:result", side: "output", label: "Result", icon: "list", type: "RoomObject[]", preview: true }
    ],
    docs: {
      summary: "Search for game objects using Screeps FIND constants and optional filters.",
      usage:
        "Configure the FIND constant and optional filters. Connect a Room input to scope the search or leave it empty to use the current room context.",
      inputs: "- **Room:** Optional room context when querying outside the current room.",
      outputs: "- **Result:** Array or single object depending on the mode configured in the node.",
      notes: "Combine with Sort / Best to pick a single target."
    },
    shortcuts: { search: "/" },
    codegen: { emitter: "query" }
  },
  "query.resolveById": {
    kind: "query.resolveById",
    title: "Resolve ID",
    acronym: "ID",
    icon: "id",
    family: "query",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    ports: [
      { id: "input:id", side: "input", label: "ID", icon: "id", type: "string", preview: true, required: true },
      { id: "data:result", side: "output", label: "Object", icon: "target", type: "RoomObject", preview: true }
    ],
    docs: {
      summary: "Resolve a game object by its Game.getObjectById identifier.",
      usage:
        "Provide the persistent object ID via configuration or an input connection. The node outputs the object if it exists, otherwise null.",
      inputs: "- **ID:** String identifier returned from Screeps APIs.",
      outputs: "- **Object:** Resolved game object or null when not found.",
      notes: "Useful for caching targets across ticks using Memory."
    },
    codegen: { emitter: "query" }
  },
  "query.sortBest": {
    kind: "query.sortBest",
    title: "Sort / Best",
    acronym: "SB",
    icon: "list",
    family: "query",
    category: "Query & Targeting",
    color: QUERY_COLOR,
    ports: [
      { id: "input:list", side: "input", label: "List", icon: "list", type: "RoomObject[]", required: true },
      { id: "data:result", side: "output", label: "Best", icon: "target", type: "RoomObject", preview: true }
    ],
    docs: {
      summary: "Select the best item from a list using scoring strategies.",
      usage:
        "Connect a list of targets and choose a scoring strategy (closest by range/path or min/max by property). The highest-ranked entry is emitted as the Best output.",
      inputs: "- **List:** Array of candidates produced by other query nodes.",
      outputs: "- **Best:** Top-ranked candidate after sorting.",
      notes: "When configured for 'all' mode the original list is sorted in-place."
    },
    codegen: { emitter: "query" }
  }
};
