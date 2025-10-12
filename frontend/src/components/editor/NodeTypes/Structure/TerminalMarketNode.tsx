import { createNodeComponent } from "../BaseNode";
import type { NodeDefinition } from "../types";
import { RESOURCES } from "../../../../shared/constants";

const resourceOptions = RESOURCES.map((resource) => ({
  label: resource.replace("RESOURCE_", ""),
  value: resource,
}));

const baseDefinition: Omit<NodeDefinition, "Component"> = {
  kind: "structure.terminalMarket",
  type: "structure.terminalMarket",
  title: "Terminal Market",
  subtitle: "Structure",
  description: "Execute market buy, sell or deal operations via terminal.",
  family: "structure",
  category: "Structure Logic",
  defaultConfig: {
    mode: "sell",
    resource: "RESOURCE_ENERGY",
    price: 1,
    amount: 1000,
  },
  configFields: [
    {
      type: "select",
      name: "mode",
      label: "Mode",
      options: [
        { label: "Buy", value: "buy" },
        { label: "Sell", value: "sell" },
        { label: "Deal", value: "deal" },
      ],
    },
    {
      type: "select",
      name: "resource",
      label: "Resource",
      options: resourceOptions,
    },
    { type: "number", name: "price", label: "Price", min: 0, step: 0.01 },
    { type: "number", name: "amount", label: "Amount", min: 0, step: 100 },
  ],
  dataInputs: [
    {
      name: "terminal",
      label: "Terminal",
      handleId: "input:terminal",
      optional: true,
    },
  ],
};

export const TerminalMarketNode = createNodeComponent(baseDefinition);

export const terminalMarketNodeDefinition: NodeDefinition = {
  ...baseDefinition,
  Component: TerminalMarketNode,
};
