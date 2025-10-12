export const FIND_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Sources", value: "FIND_SOURCES" },
  { label: "Minerals", value: "FIND_MINERALS" },
  { label: "Structures", value: "FIND_STRUCTURES" },
  { label: "Construction Sites", value: "FIND_CONSTRUCTION_SITES" },
  { label: "Creeps", value: "FIND_CREEPS" },
  { label: "My Structures", value: "FIND_MY_STRUCTURES" },
  { label: "Hostile Creeps", value: "FIND_HOSTILE_CREEPS" },
];

export const LOOK_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Terrain", value: "LOOK_TERRAIN" },
  { label: "Structures", value: "LOOK_STRUCTURES" },
  { label: "Creeps", value: "LOOK_CREEPS" },
  { label: "Resources", value: "LOOK_RESOURCES" },
];

export const MOVE_ADAPTERS: Array<{ label: string; value: string }> = [
  { label: "Traveler", value: "Traveler" },
  { label: "PathFinder", value: "PathFinder" },
  { label: "Simple", value: "Simple" },
];

export const LOOP_TYPES: Array<{ label: string; value: string }> = [
  { label: "For Loop", value: "for" },
  { label: "While Loop", value: "while" },
];

export const MEMORY_SCOPES: Array<{ label: string; value: string }> = [
  { label: "Global", value: "global" },
  { label: "Room", value: "room" },
  { label: "Creep", value: "creep" },
];

export const RESOURCES: string[] = [
  "RESOURCE_ENERGY",
  "RESOURCE_UTRIUM",
  "RESOURCE_KEANIUM",
  "RESOURCE_LEMERGIUM",
  "RESOURCE_ZYNTHIUM",
  "RESOURCE_OXYGEN",
  "RESOURCE_HYDROGEN",
  "RESOURCE_CATALYST",
];

export const TASK_PARAM_TYPES: Array<{ label: string; value: string }> = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Game Object ID", value: "id" },
  { label: "Room Position", value: "pos" },
  { label: "Any", value: "any" },
];
