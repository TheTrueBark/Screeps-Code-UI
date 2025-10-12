import type { NodeMeta } from "./schema";

const ECON_COLOR = "#22c55e";

/**
 * Economy & Market nodes manage credits, terminal trades, and analytics.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Market order management. Docs: https://docs.screeps.com/api/#Game.market
   */
  "economy.marketOrder": {
    kind: "economy.marketOrder",
    title: "Market Order",
    acronym: "MO",
    icon: "market",
    family: "economyMarket",
    category: "Economy & Market",
    color: ECON_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "create",
        description:
          "Choose between creating, extending, or cancelling an order.",
        options: [
          { value: "create", label: "Create" },
          { value: "extend", label: "Extend" },
          { value: "cancel", label: "Cancel" },
        ],
      },
      {
        key: "resource",
        label: "Resource",
        type: "string",
        default: "RESOURCE_ENERGY",
        description: "Resource associated with the order.",
      },
      {
        key: "price",
        label: "Price",
        type: "number",
        default: 1,
        description: "Credits per unit when creating or extending orders.",
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        default: 1000,
        description: "Number of units affected by the operation.",
      },
    ],
    defaultInputs: [
      {
        id: "input:terminal",
        label: "Terminal",
        type: "StructureTerminal",
        optional: true,
        description: "Terminal used for order matching when required.",
      },
      {
        id: "input:orderId",
        label: "Order ID",
        type: "string",
        optional: true,
        description: "Existing order identifier for extend/cancel modes.",
      },
    ],
    defaultOutputs: [
      {
        id: "data:result",
        label: "Result",
        type: "number",
        description: "Return code from the market operation.",
      },
    ],
    editableExtensions: [
      {
        key: "autoPricing",
        label: "Auto pricing",
        type: "boolean",
        default: false,
        description: "Derive price using history averages or custom formulas.",
      },
      {
        key: "commissionGuard",
        label: "Commission guard",
        type: "number",
        default: 0.05,
        description:
          "Abort orders when fees exceed the specified fraction of trade value.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "input:terminal",
        side: "input",
        label: "Terminal",
        icon: "market",
        type: "object",
      },
      {
        id: "input:orderId",
        side: "input",
        label: "Order ID",
        icon: "market",
        type: "string",
      },
      {
        id: "data:result",
        side: "output",
        label: "Result",
        icon: "market",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Create, extend, or cancel market orders with optional pricing safeguards.",
      usage:
        "Configure mode, resource, and price. Provide order IDs for existing orders and optionally link a terminal for context.",
      inputs:
        "- **Terminal:** StructureTerminal executing trades.\n- **Order ID:** Identifier for existing orders.",
      outputs: "- **Result:** Screeps return code.",
      notes:
        "Auto pricing and commission guards reduce manual tuning during volatile markets.",
    },
    codegen: { emitter: "economy" },
  },
  /**
   * Calculate transaction cost. Docs: https://docs.screeps.com/api/#Game.market.calcTransactionCost
   */
  "economy.calcCost": {
    kind: "economy.calcCost",
    title: "Transaction Cost",
    acronym: "TC",
    icon: "market",
    family: "economyMarket",
    category: "Economy & Market",
    color: ECON_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "amount",
        label: "Amount",
        type: "number",
        default: 1000,
        description: "Amount of resources to evaluate.",
      },
      {
        key: "roomFrom",
        label: "From room",
        type: "string",
        default: "W0N0",
        description: "Origin room name.",
      },
      {
        key: "roomTo",
        label: "To room",
        type: "string",
        default: "W1N1",
        description: "Destination room name.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:energy",
        label: "Energy cost",
        type: "number",
        description: "Energy required to execute the market transaction.",
      },
    ],
    editableExtensions: [
      {
        key: "marginThreshold",
        label: "Margin threshold",
        type: "number",
        default: 0.1,
        description:
          "Minimum profit margin required to consider the trade viable.",
      },
      {
        key: "batchAmount",
        label: "Batch amount",
        type: "number",
        default: 5000,
        description:
          "Evaluate cost for batch sizes when planning multiple trades.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "data:energy",
        side: "output",
        label: "Energy cost",
        icon: "market",
        type: "number",
      },
    ],
    docs: {
      summary:
        "Estimate terminal energy cost for inter-room resource transfers.",
      usage:
        "Set amount and rooms to evaluate. Use margin threshold to filter unprofitable trades.",
      outputs: "- **Energy cost:** Energy required for the specified transfer.",
      notes: "Batch calculation helps plan multi-order logistics.",
    },
    codegen: { emitter: "economy" },
  },
  /**
   * Economy overview analytics node.
   */
  "economy.resourceLedger": {
    kind: "economy.resourceLedger",
    title: "Resource Ledger",
    acronym: "RL",
    icon: "market",
    family: "economyMarket",
    category: "Economy & Market",
    color: ECON_COLOR,
    availability: "planned",
    defaultSettings: [
      {
        key: "rooms",
        label: "Rooms",
        type: "list",
        default: [],
        description:
          "Rooms to include in the ledger (empty means all owned rooms).",
      },
      {
        key: "resources",
        label: "Resources",
        type: "list",
        default: ["RESOURCE_ENERGY", "RESOURCE_HYDROGEN"],
        description: "Resource constants to track.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "data:ledger",
        label: "Ledger",
        type: "object",
        description: "Aggregated resource totals per room and globally.",
      },
    ],
    editableExtensions: [
      {
        key: "history",
        label: "History length",
        type: "number",
        default: 20,
        description: "Ticks of historical data to retain for trend analysis.",
      },
      {
        key: "notify",
        label: "Notify threshold",
        type: "number",
        default: 0,
        description: "Send notification when totals drop below this value.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "data:ledger",
        side: "output",
        label: "Ledger",
        icon: "market",
        type: "object",
      },
    ],
    docs: {
      summary:
        "Summarize resource balances across owned rooms for dashboarding.",
      usage:
        "Configure tracked resources and optionally limit to select rooms. Use the ledger output to feed UI panels or alert systems.",
      outputs:
        "- **Ledger:** Object containing per-room and total resource counts.",
      notes:
        "History tracking enables trend visualization in future analytics modules.",
    },
    codegen: { emitter: "economy" },
  },
};
