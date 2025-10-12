import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { LOOK_OPTIONS } from "../../../../shared/constants";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "query.neighborhood",
  type: "query.neighborhood",
  title: "Neighborhood",
  subtitle: "Query",
  description: "Gather room terrain or structures in the surrounding area.",
  family: "queryTargeting",
  category: "Query & Targeting",
  defaultConfig: {
    mode: "lookAt",
    radius: 1,
    type: "LOOK_TERRAIN",
  },
  configFields: [
    {
      type: "select",
      name: "mode",
      label: "Mode",
      options: [
        { label: "Look At", value: "lookAt" },
        { label: "Look For Area", value: "lookForAtArea" },
      ],
    },
    { type: "number", name: "radius", label: "Radius", min: 0, step: 1 },
    { type: "select", name: "type", label: "Look Type", options: LOOK_OPTIONS },
  ],
  dataOutputs: [{ name: "result", label: "Tiles", handleId: "data:result" }],
};

export const NeighborhoodNode = createNodeComponent(baseDefinition);

export const neighborhoodNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: NeighborhoodNode,
};
