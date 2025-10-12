import type { NodeMeta } from "./schema";

const FLOW_COLOR = "#00c8ff";

export const nodes: Record<string, NodeMeta> = {
  "flow.start": {
    kind: "flow.start",
    title: "Start",
    acronym: "ST",
    icon: "flow",
    family: "flow",
    category: "Flow & Control",
    color: FLOW_COLOR,
    ports: [
      {
        id: "flow:out",
        side: "output",
        label: "Next",
        type: "flow",
        icon: "flow",
      },
    ],
    docs: {
      summary: "Entry point executed once per tick for the active file.",
      usage:
        "Use a single Start node per workflow. Connect its flow output to the first control node that should run each tick.",
      outputs: "- **Next:** Flow output that begins your automation pipeline.",
      notes: "Only one Start node should exist in a graph.",
    },
    shortcuts: { focus: "Shift+S" },
    codegen: { emitter: "flow" },
  },
  "flow.if": {
    kind: "flow.if",
    title: "If",
    acronym: "IF",
    icon: "branch",
    family: "flow",
    category: "Flow & Control",
    color: FLOW_COLOR,
    autoExpand: true,
    ports: [
      {
        id: "input:cond",
        side: "input",
        label: "Condition",
        icon: "branch",
        type: "boolean",
        required: true,
        preview: true,
      },
      {
        id: "slot:true",
        side: "output",
        label: "True",
        icon: "branch",
        type: "flow",
      },
      {
        id: "slot:false",
        side: "output",
        label: "False",
        icon: "branch",
        type: "flow",
      },
    ],
    docs: {
      summary: "Branches execution depending on a boolean condition.",
      usage:
        "Supply a boolean expression or connect a query result to the Condition input. The workflow continues through the True branch when the value is truthy and through the False branch otherwise.",
      inputs:
        "- **Condition:** Boolean expression that determines which branch to run.",
      outputs:
        "- **True:** Flow branch executed when the condition is truthy.\n- **False:** Flow branch executed when the condition is falsy.",
      notes:
        "Short-circuit logic can be enabled via the node configuration to skip evaluation when a literal value is present.",
    },
    shortcuts: { toggle: "Ctrl+Enter" },
    codegen: {
      emitter: "flow",
      template: "if ($cond$) {$true$} else {$false$}",
    },
  },
  "flow.switch": {
    kind: "flow.switch",
    title: "Switch",
    acronym: "SW",
    icon: "switch",
    family: "flow",
    category: "Flow & Control",
    color: FLOW_COLOR,
    autoExpand: true,
    ports: [
      {
        id: "input:key",
        side: "input",
        label: "Key",
        icon: "switch",
        type: "string",
        preview: true,
      },
      {
        id: "slot:caseA",
        side: "output",
        label: "Case A",
        icon: "switch",
        type: "flow",
        dynamic: true,
      },
      {
        id: "slot:caseB",
        side: "output",
        label: "Case B",
        icon: "switch",
        type: "flow",
        dynamic: true,
      },
      {
        id: "slot:default",
        side: "output",
        label: "Default",
        icon: "switch",
        type: "flow",
      },
    ],
    docs: {
      summary: "Routes flow to the matching case output based on an input key.",
      usage:
        "Provide a string or numeric key. Configure additional cases in the node to branch to different flows. Unmatched values fall back to the Default output.",
      inputs: "- **Key:** Expression evaluated once per tick to select a case.",
      outputs:
        "- **Cases:** Flow outputs for each configured case value.\n- **Default:** Flow path when no case matches.",
      notes: "Cases are evaluated in declaration order.",
    },
    codegen: { emitter: "flow", template: "switch ($key$) { ... }" },
  },
  "flow.loop": {
    kind: "flow.loop",
    title: "Loop",
    acronym: "LP",
    icon: "loop",
    family: "flow",
    category: "Flow & Control",
    color: FLOW_COLOR,
    ports: [
      {
        id: "input:count",
        side: "input",
        label: "Iterations",
        icon: "loop",
        type: "number",
        preview: true,
      },
      {
        id: "slot:body",
        side: "output",
        label: "Body",
        icon: "loop",
        type: "flow",
      },
      {
        id: "slot:exit",
        side: "output",
        label: "Exit",
        icon: "loop",
        type: "flow",
      },
    ],
    docs: {
      summary: "Repeats the body branch a configured number of iterations.",
      usage:
        "Set the iteration count via configuration or connect a numeric input. The Body branch runs for each iteration and Exit fires when looping completes.",
      inputs: "- **Iterations:** Number of times to execute the Body branch.",
      outputs:
        "- **Body:** Flow branch executed for each iteration.\n- **Exit:** Flow branch after the loop finishes.",
      notes: "Use Break/Continue nodes within the loop to control execution.",
    },
    codegen: {
      emitter: "flow",
      template: "for (let i = 0; i < $count$; i++) {$body$}",
    },
  },
  "flow.return": {
    kind: "flow.return",
    title: "Return",
    acronym: "RT",
    icon: "flow",
    family: "flow",
    category: "Flow & Control",
    color: FLOW_COLOR,
    ports: [
      {
        id: "input:value",
        side: "input",
        label: "Value",
        icon: "flow",
        type: "any",
        preview: true,
        required: false,
      },
    ],
    docs: {
      summary: "Ends the current workflow and optionally returns a value.",
      usage:
        "Place at the end of a branch to stop execution for the current tick. Connect a value if your script expects a return payload.",
      inputs: "- **Value:** Optional data returned from the workflow.",
      notes: "Only the first Return encountered per tick is respected.",
    },
    codegen: { emitter: "flow", template: "return $value$;" },
  },
};
