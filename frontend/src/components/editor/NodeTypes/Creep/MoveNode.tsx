import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { MOVE_ADAPTERS } from "../../../../shared/constants";

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "creep.move",
  type: "creep.move",
  title: "Move",
  subtitle: "Creep",
  description:
    "Move a creep using the selected pathing adapter and parameters.",
  family: "creep",
  category: "Creep Actions",
  defaultConfig: {
    adapter: "Traveler",
    range: 1,
    reusePath: 5,
    flee: false,
    avoidHostiles: true,
  },
  configFields: [
    {
      type: "select",
      name: "adapter",
      label: "Adapter",
      options: MOVE_ADAPTERS,
    },
    { type: "number", name: "range", label: "Range", min: 0, step: 1 },
    { type: "number", name: "reusePath", label: "Reuse path", min: 0, step: 1 },
    { type: "checkbox", name: "flee", label: "Flee mode" },
    { type: "checkbox", name: "avoidHostiles", label: "Avoid hostiles" },
  ],
  dataInputs: [
    {
      name: "creepRef",
      label: "Creep",
      handleId: "input:creep",
      optional: true,
    },
    {
      name: "targetPos",
      label: "Target",
      handleId: "input:targetPos",
      optional: false,
    },
  ],
};

export const MoveNode = createNodeComponent(baseDefinition);

export const moveNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: MoveNode,
};
