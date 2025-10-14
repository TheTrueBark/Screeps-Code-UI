import type { NodeMeta } from "./schema";

const FLOW_COLOR = "#00c8ff";

/**
 * Flow & Control nodes orchestrate execution order of the automation graph.
 */
export const nodes: Record<string, NodeMeta> = {
  /**
   * Screeps main loop entry point. Docs: https://docs.screeps.com/api/#Game
   */
  "flow.start": {
    kind: "flow.start",
    title: "Start / Tick Entry",
    acronym: "ST",
    icon: "flow",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "label",
        label: "Label",
        type: "string",
        default: "tick start",
        description:
          "Annotation displayed on the node header to identify the tick entry point.",
      },
      {
        key: "flowMode",
        label: "Flow behaviour",
        type: "enum",
        default: "next",
        description:
          "Choose whether the node emits flow immediately (Next) or on a schedule.",
        options: [
          { label: "Next", value: "next" },
          { label: "Schedule", value: "schedule" },
        ],
      },
      {
        key: "scheduleMode",
        label: "Schedule mode",
        type: "enum",
        default: "everyTick",
        description:
          "When scheduling is enabled, determine the cadence for triggering downstream flow.",
        options: [
          { label: "Every tick", value: "everyTick" },
          { label: "Every N ticks", value: "interval" },
          { label: "Modulo", value: "modulo" },
        ],
      },
      {
        key: "tickSpan",
        label: "Tick interval",
        type: "number",
        default: 1,
        description:
          "Number of ticks between scheduled executions when using interval or modulo modes.",
      },
      {
        key: "moduloOffset",
        label: "Modulo offset",
        type: "number",
        default: 0,
        description:
          "Offset applied to modulo scheduling to shift the tick remainder that triggers execution.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "flow:out",
        label: "Next",
        type: "flow",
        description: "Primary flow output fired once each game tick.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "errorTrap",
        label: "Error trap branch",
        type: "boolean",
        default: false,
        description:
          "Expose an auxiliary flow output that activates if downstream execution throws.",
        advanced: true,
      },
      {
        key: "conditionGuard",
        label: "Condition guard",
        type: "expression",
        default: "Game.cpu.bucket > 0",
        description:
          "Optional expression gate; the node only emits flow when the guard resolves truthy.",
        advanced: true,
      },
    ],
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
      summary:
        "Entry point executed once per tick or on a configurable schedule for the active automation file.",
      usage:
        "Place a single Start node in the graph and connect its flow output to the first control construct or action. Switch the flow behaviour to Schedule when the pipeline should run on a cadence rather than every tick.",
      outputs: "- **Next:** Flow output that begins the automation pipeline.",
      notes:
        "Only one Start node should exist in a graph to avoid duplicate execution.",
    },
    shortcuts: { focus: "Shift+S" },
    codegen: { emitter: "flow" },
  },
  /**
   * Conditional branching similar to JavaScript `if`. Docs: https://docs.screeps.com/api/#Room
   */
  "flow.if": {
    kind: "flow.if",
    title: "If",
    acronym: "IF",
    icon: "branch",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "condition",
        label: "Condition expression",
        type: "expression",
        default: "creep.store.getUsedCapacity() > 0",
        description:
          "Default expression evaluated to choose between the True or False branches.",
      },
    ],
    defaultInputs: [
      {
        id: "input:cond",
        label: "Condition",
        type: "boolean",
        description:
          "Boolean signal that determines which branch to execute. Overrides the inline expression when wired.",
      },
    ],
    defaultOutputs: [
      {
        id: "slot:true",
        label: "True",
        type: "flow",
        description: "Flow branch executed when the condition resolves truthy.",
        flow: true,
      },
      {
        id: "slot:false",
        label: "False",
        type: "flow",
        description: "Flow branch executed when the condition resolves falsy.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "shortCircuit",
        label: "Short-circuit when literal",
        type: "boolean",
        default: true,
        description:
          "Skip evaluating connected inputs when a constant condition value is configured.",
        advanced: true,
      },
      {
        key: "elseIfChain",
        label: "Else-if chain",
        type: "list",
        default: [],
        description:
          "Configure additional keyed condition slots that appear as intermediate flow ports.",
        advanced: true,
      },
      {
        key: "defaultBranch",
        label: "Default branch",
        type: "boolean",
        default: false,
        description:
          "Adds a fallback flow port that executes when no branch handles the condition.",
        advanced: true,
      },
      {
        key: "errorBranch",
        label: "Error branch",
        type: "boolean",
        default: false,
        description:
          "Expose an error-handling flow output to capture exceptions raised within either branch.",
        advanced: true,
      },
    ],
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
        "- **Condition:** Boolean expression or signal used to decide the branch.",
      outputs:
        "- **True:** Flow branch executed when the condition is truthy.\n- **False:** Flow branch executed when the condition is falsy.",
      notes:
        "Short-circuit logic can be enabled via configuration to avoid redundant evaluations when literals are used.",
    },
    shortcuts: { toggle: "Ctrl+Enter" },
    codegen: {
      emitter: "flow",
      template: "if ($cond$) {$true$} else {$false$}",
    },
  },
  /**
   * Multi-branch control flow. Docs: https://docs.screeps.com/api/#Game.getObjectById
   */
  "flow.switch": {
    kind: "flow.switch",
    title: "Switch",
    acronym: "SW",
    icon: "switch",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "keyExpression",
        label: "Key expression",
        type: "expression",
        default: "Memory.rooms[targetRoom].mode",
        description:
          "Expression evaluated once per tick to choose the active case output.",
      },
      {
        key: "cases",
        label: "Case list",
        type: "list",
        default: [{ value: "harvest" }, { value: "upgrade" }],
        description:
          "Initial case values. Each value creates a flow output that can be connected to handlers.",
      },
    ],
    defaultInputs: [
      {
        id: "input:key",
        label: "Key",
        type: "string",
        description:
          "Optional wired value that overrides the inline key expression when provided.",
      },
    ],
    defaultOutputs: [
      {
        id: "slot:caseA",
        label: "Case A",
        type: "flow",
        description:
          "Flow branch executed when the key matches the first configured value.",
        flow: true,
      },
      {
        id: "slot:caseB",
        label: "Case B",
        type: "flow",
        description:
          "Flow branch executed when the key matches the second configured value.",
        flow: true,
      },
      {
        id: "slot:default",
        label: "Default",
        type: "flow",
        description: "Fallback flow branch when no case matches the key.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "caseDefinitions",
        label: "Add/remove cases",
        type: "list",
        default: [],
        description:
          "Manage additional case values, rename labels, or assign metadata for documentation.",
      },
      {
        key: "fallthrough",
        label: "Enable fallthrough",
        type: "boolean",
        default: false,
        description:
          "Allow execution to continue into the next case if the current handler finishes without returning.",
        advanced: true,
      },
      {
        key: "rangeMatching",
        label: "Range matching",
        type: "boolean",
        default: false,
        description:
          "Interpret case descriptors as [min,max] tuples for numeric comparisons.",
        advanced: true,
      },
    ],
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
      summary:
        "Routes flow to the matching case output based on a key expression or wired value.",
      usage:
        "Provide a string or numeric key. Configure additional cases in the node to branch to different flows. Unmatched values fall back to the Default output.",
      inputs:
        "- **Key:** Expression or input evaluated once per tick to select a case.",
      outputs:
        "- **Cases:** Flow outputs for each configured case value.\n- **Default:** Flow path when no case matches.",
      notes:
        "Cases are evaluated in declaration order and can optionally fall through.",
    },
    codegen: { emitter: "flow", template: "switch ($key$) { ... }" },
  },
  /**
   * Iterative control. Docs: https://docs.screeps.com/api/#Room.find
   */
  "flow.loop": {
    kind: "flow.loop",
    title: "Loop",
    acronym: "LP",
    icon: "loop",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "variant",
        label: "Loop type",
        type: "enum",
        default: "for",
        options: [
          { value: "for", label: "For" },
          { value: "while", label: "While" },
          { value: "forEach", label: "For..of" },
        ],
        description:
          "Select the looping strategy used during code generation and execution.",
      },
      {
        key: "iterator",
        label: "Iterator name",
        type: "string",
        default: "i",
        description:
          "Symbol name assigned to the loop counter or iterable element in generated code.",
      },
      {
        key: "maxIterations",
        label: "Max iterations",
        type: "number",
        default: 20,
        description: "Safety clamp limiting total loop executions per tick.",
      },
    ],
    defaultInputs: [
      {
        id: "input:count",
        label: "Iterations",
        type: "number",
        description:
          "When wired, overrides the configured maximum iteration count for bounded loops.",
        optional: true,
      },
    ],
    defaultOutputs: [
      {
        id: "slot:body",
        label: "Body",
        type: "flow",
        description: "Flow branch executed for each iteration.",
        flow: true,
      },
      {
        id: "slot:exit",
        label: "Exit",
        type: "flow",
        description:
          "Flow branch executed once after the loop completes or breaks.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "step",
        label: "Step size",
        type: "number",
        default: 1,
        description:
          "Increment applied to the iterator between iterations for index-based loops.",
        advanced: true,
      },
      {
        key: "breakGuard",
        label: "Break limit guard",
        type: "number",
        default: 200,
        description:
          "Hard stop to prevent runaway loops when exit conditions are not met (useful for while loops).",
        advanced: true,
      },
      {
        key: "nestedDepth",
        label: "Nested depth",
        type: "number",
        default: 1,
        description:
          "Annotate how deep this loop may be nested to assist future scheduling/visualization tools.",
        advanced: true,
      },
      {
        key: "indexExpose",
        label: "Expose iteration index",
        type: "boolean",
        default: true,
        description:
          "Expose the iterator index as a data output slot for downstream expressions.",
      },
    ],
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
  /**
   * Exception handling wrapper. Docs: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/try...catch
   */
  "flow.try": {
    kind: "flow.try",
    title: "Try / Catch / Finally",
    acronym: "TRY",
    icon: "shield",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "errorVar",
        label: "Error variable",
        type: "string",
        default: "err",
        description:
          "Identifier to bind the thrown error inside the Catch branch for reference.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "slot:try",
        label: "Try",
        type: "flow",
        description: "Primary flow executed inside the guarded block.",
        flow: true,
      },
      {
        id: "slot:catch",
        label: "Catch",
        type: "flow",
        description:
          "Flow executed when an exception is thrown within the Try branch.",
        flow: true,
      },
      {
        id: "slot:finally",
        label: "Finally",
        type: "flow",
        description:
          "Flow executed after Try or Catch completes, regardless of success or failure.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "catchMap",
        label: "Catch type filters",
        type: "list",
        default: [],
        description:
          "Define predicates or error codes that route to specialized catch sub-branches.",
        advanced: true,
      },
      {
        key: "rethrow",
        label: "Rethrow error",
        type: "boolean",
        default: false,
        description:
          "Automatically propagate the error after the Catch branch completes.",
        advanced: true,
      },
      {
        key: "defaultPath",
        label: "Default path",
        type: "boolean",
        default: false,
        description:
          "Expose a success continuation output for when no exception occurs.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "slot:try",
        side: "output",
        label: "Try",
        icon: "flow",
        type: "flow",
      },
      {
        id: "slot:catch",
        side: "output",
        label: "Catch",
        icon: "flow",
        type: "flow",
      },
      {
        id: "slot:finally",
        side: "output",
        label: "Finally",
        icon: "flow",
        type: "flow",
      },
    ],
    docs: {
      summary: "Wraps flow execution in error handling with optional cleanup.",
      usage:
        "Connect the Try output to the logic that may throw. Use the Catch branch to respond to failures and the Finally branch for cleanup or continuation logic.",
      outputs:
        "- **Try:** Flow executed inside the guarded block.\n- **Catch:** Flow executed when an error is thrown.\n- **Finally:** Flow executed after Try/Catch completes.",
      notes:
        "Useful for isolating risky operations such as remote market calls or pathfinding.",
    },
    codegen: {
      emitter: "flow",
      template: "try {$try$} catch ($errorVar$) {$catch$} finally {$finally$}",
    },
  },
  /**
   * Early exit from tasks. Docs: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/return
   */
  "flow.return": {
    kind: "flow.return",
    title: "Return",
    acronym: "RT",
    icon: "flow",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "expression",
        label: "Return expression",
        type: "expression",
        default: "OK",
        description:
          "Value returned to the caller or task when this node executes.",
      },
    ],
    defaultInputs: [
      {
        id: "input:value",
        label: "Value",
        type: "any",
        description:
          "Optional wired value that overrides the configured return expression.",
        optional: true,
      },
    ],
    defaultOutputs: [],
    editableExtensions: [
      {
        key: "cleanupHooks",
        label: "On-return cleanup hooks",
        type: "list",
        default: [],
        description:
          "Define additional flow snippets or function references to run before returning.",
        advanced: true,
      },
      {
        key: "fallbackValue",
        label: "Fallback return",
        type: "expression",
        default: "ERR_NOT_FOUND",
        description:
          "Backup value emitted when neither the input nor expression resolves.",
        advanced: true,
      },
      {
        key: "throwInstead",
        label: "Throw instead",
        type: "boolean",
        default: false,
        description:
          "Convert the return into an exception to propagate failure states upstream.",
        advanced: true,
      },
    ],
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
      summary: "Stops flow execution and returns a value to the caller.",
      usage:
        "Provide a literal value or wire a data input. Place Return nodes at the end of task definitions or control blocks that should terminate early.",
      inputs: "- **Value:** Data sent back to the caller when execution stops.",
      notes:
        "No flow outputs are available because execution halts at this node.",
    },
    codegen: { emitter: "flow", template: "return $value$;" },
  },
  /**
   * Loop interruption commands. Docs: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/break
   */
  "flow.break": {
    kind: "flow.break",
    title: "Break / Continue",
    acronym: "BR",
    icon: "flow",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "break",
        options: [
          { value: "break", label: "Break" },
          { value: "continue", label: "Continue" },
        ],
        description:
          "Choose whether to exit the loop entirely or skip to the next iteration.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [],
    editableExtensions: [
      {
        key: "targetLoop",
        label: "Target loop selector",
        type: "string",
        default: "",
        description:
          "Specify a labelled loop identifier when acting on nested loops.",
        advanced: true,
      },
      {
        key: "guard",
        label: "Condition guard",
        type: "expression",
        default: "true",
        description:
          "Optional expression to decide dynamically whether to apply the break/continue.",
        advanced: true,
      },
    ],
    ports: [],
    docs: {
      summary:
        "Signals the active loop to break or continue based on configuration.",
      usage:
        "Place inside Loop bodies to gain explicit control over iteration termination or skipping.",
      notes:
        "A guard expression can be configured to make the behavior conditional.",
    },
    codegen: { emitter: "flow", template: "$mode$;" },
  },
  /**
   * Tick scheduling helper. Docs: https://docs.screeps.com/api/#Game.time
   */
  "flow.schedule": {
    kind: "flow.schedule",
    title: "Schedule / Timer",
    acronym: "SC",
    icon: "clock",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "mode",
        label: "Mode",
        type: "enum",
        default: "interval",
        options: [
          { value: "interval", label: "Every N ticks" },
          { value: "modulo", label: "Modulo" },
        ],
        description:
          "Choose whether to run on a fixed interval or only when Game.time % N === offset.",
      },
      {
        key: "interval",
        label: "Interval",
        type: "number",
        default: 5,
        description: "Base tick spacing between executions.",
      },
      {
        key: "offset",
        label: "Offset",
        type: "number",
        default: 0,
        description:
          "Tick offset applied when using modulo scheduling to align with shard cadence.",
      },
    ],
    defaultInputs: [],
    defaultOutputs: [
      {
        id: "slot:body",
        label: "Body",
        type: "flow",
        description: "Flow branch executed when the schedule condition passes.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "skipLowCpu",
        label: "Skip on low CPU",
        type: "boolean",
        default: true,
        description:
          "Optionally suppress execution when Game.cpu.bucket falls under a threshold.",
        advanced: true,
      },
      {
        key: "enabled",
        label: "Enable toggle",
        type: "boolean",
        default: true,
        description:
          "Expose a runtime flag in Memory to pause the schedule without removing the node.",
      },
      {
        key: "startDelay",
        label: "Start delay",
        type: "number",
        default: 0,
        description:
          "Delay the first execution by N ticks after the graph initializes.",
        advanced: true,
      },
      {
        key: "window",
        label: "Schedule window",
        type: "number",
        default: 1,
        description:
          "Allow the scheduler to execute within a tolerance window to smooth CPU spikes.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "slot:body",
        side: "output",
        label: "Body",
        icon: "clock",
        type: "flow",
      },
    ],
    docs: {
      summary: "Runs connected flow on a configurable tick cadence.",
      usage:
        "Useful for periodic tasks such as structure balancing. Configure interval and connect the Body output to the desired logic.",
      outputs:
        "- **Body:** Flow executed when the schedule condition is satisfied.",
      notes:
        "Enabling CPU-aware skipping helps avoid bucket depletion during heavy ticks.",
    },
    codegen: { emitter: "flow" },
  },
  /**
   * Fan-out helper. Docs: https://docs.screeps.com/api/#Game.structures
   */
  "flow.split": {
    kind: "flow.split",
    title: "Splitter",
    acronym: "SP",
    icon: "split",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [
      {
        key: "branches",
        label: "Branch count",
        type: "number",
        default: 2,
        description: "Number of parallel flow outputs emitted simultaneously.",
      },
    ],
    defaultInputs: [
      {
        id: "flow:in",
        label: "In",
        type: "flow",
        description: "Trigger input to broadcast downstream.",
        flow: true,
      },
    ],
    defaultOutputs: [
      {
        id: "slot:branch-0",
        label: "Branch 1",
        type: "flow",
        description: "First branch executed when the node triggers.",
        flow: true,
      },
      {
        id: "slot:branch-1",
        label: "Branch 2",
        type: "flow",
        description: "Second branch executed when the node triggers.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "labels",
        label: "Branch labels",
        type: "list",
        default: [],
        description:
          "Rename branch outputs or assign semantic tags for documentation.",
      },
      {
        key: "conditions",
        label: "Conditional gating",
        type: "list",
        default: [],
        description:
          "Provide optional expressions per branch to enable/disable emission dynamically.",
        advanced: true,
      },
      {
        key: "weights",
        label: "Branch weighting",
        type: "object",
        default: {},
        description:
          "Assign numeric weights to control downstream scheduling prioritization.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "flow:in",
        side: "input",
        label: "In",
        type: "flow",
        icon: "flow",
      },
      {
        id: "slot:branch-0",
        side: "output",
        label: "Branch 1",
        icon: "split",
        type: "flow",
        dynamic: true,
      },
      {
        id: "slot:branch-1",
        side: "output",
        label: "Branch 2",
        icon: "split",
        type: "flow",
        dynamic: true,
      },
    ],
    docs: {
      summary: "Broadcasts incoming flow to multiple downstream branches.",
      usage:
        "Connect the input to an upstream controller. Configure branch count to spawn additional outputs and wire them to independent sub-graphs.",
      inputs: "- **In:** Flow trigger propagated to each configured branch.",
      outputs:
        "- **Branches:** Parallel flows executed when the splitter is triggered.",
      notes:
        "Branch conditions and weights are available for advanced coordination.",
    },
    codegen: { emitter: "flow" },
  },
  /**
   * Fan-in helper. Docs: https://docs.screeps.com/api/#Game.cpu
   */
  "flow.merge": {
    kind: "flow.merge",
    title: "Merger",
    acronym: "MG",
    icon: "merge",
    family: "flowControl",
    category: "Flow & Control",
    color: FLOW_COLOR,
    availability: "available",
    defaultSettings: [],
    defaultInputs: [
      {
        id: "flow:in",
        label: "In",
        type: "flow",
        description: "Primary upstream flow to merge.",
        flow: true,
      },
    ],
    defaultOutputs: [
      {
        id: "flow:out",
        label: "Next",
        type: "flow",
        description: "Unified flow emitted when the merger triggers.",
        flow: true,
      },
    ],
    editableExtensions: [
      {
        key: "order",
        label: "Merge order",
        type: "list",
        default: [],
        description:
          "Define deterministic ordering when multiple inputs fire simultaneously.",
        advanced: true,
      },
      {
        key: "priority",
        label: "Prioritization",
        type: "object",
        default: {},
        description:
          "Assign numeric priorities to prefer specific inputs under contention.",
        advanced: true,
      },
      {
        key: "dedupe",
        label: "Duplicate suppression",
        type: "boolean",
        default: false,
        description:
          "Prevent repeated triggering within the same tick when upstream flows oscillate.",
        advanced: true,
      },
      {
        key: "conditional",
        label: "Conditional merge",
        type: "expression",
        default: "true",
        description:
          "Expression evaluated to permit or block the merge based on runtime state.",
        advanced: true,
      },
    ],
    ports: [
      {
        id: "flow:in",
        side: "input",
        label: "In",
        type: "flow",
        icon: "merge",
      },
      {
        id: "flow:out",
        side: "output",
        label: "Next",
        type: "flow",
        icon: "merge",
      },
    ],
    docs: {
      summary: "Merges multiple flow sources into a single continuation.",
      usage:
        "Use when independent branches converge on a shared step. Configure optional ordering or deduplication rules for deterministic execution.",
      inputs: "- **In:** Flow signal combined into the unified output.",
      outputs:
        "- **Next:** Flow emitted once per triggering input, respecting dedupe settings.",
      notes: "Additional inputs can be added via editable extensions.",
    },
    codegen: { emitter: "flow" },
  },
};
