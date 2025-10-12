import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { FIND_OPTIONS } from "../../../../shared/constants";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "query.find",
  type: "query.find",
  title: "Find",
  subtitle: "Query",
  description:
    "Search for game objects using Screeps find constants and optional filters.",
  family: "queryTargeting",
  category: "Query & Targeting",
  defaultConfig: {
    findConstant: "FIND_SOURCES",
    mode: "first",
    roomScope: "current",
    roomName: "",
    filters: [],
    limit: 1,
  },
  configFields: [
    {
      type: "select",
      name: "findConstant",
      label: "Find constant",
      options: FIND_OPTIONS,
    },
    {
      type: "select",
      name: "mode",
      label: "Mode",
      options: [
        { label: "First match", value: "first" },
        { label: "All matches", value: "all" },
      ],
    },
    {
      type: "select",
      name: "roomScope",
      label: "Room scope",
      options: [
        { label: "Current room", value: "current" },
        { label: "Specific room", value: "name" },
      ],
    },
    { type: "text", name: "roomName", label: "Room name", placeholder: "W0N0" },
    {
      type: "json",
      name: "filters",
      label: "Filters",
      helper: "Array of { field, op, value } filter definitions.",
    },
    { type: "number", name: "limit", label: "Limit", min: 1, step: 1 },
  ],
  dataOutputs: [
    {
      name: "result",
      label: "Result",
      handleId: "data:result",
    },
  ],
};

export const FindNode = createNodeComponent(baseDefinition);

export const findNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: FindNode,
};
