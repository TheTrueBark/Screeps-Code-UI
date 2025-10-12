export type NodeFamily =
  | "flowControl"
  | "queryTargeting"
  | "creepActions"
  | "structureLogic"
  | "economyMarket"
  | "power"
  | "memoryData"
  | "mapNavigation"
  | "globalGame"
  | "taskMacro";

export type NodeAvailability = "available" | "experimental" | "planned";

export interface NodeSettingSpec {
  key: string;
  label: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "enum"
    | "expression"
    | "json"
    | "object"
    | "list";
  default: unknown;
  description: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface NodeIODetail {
  id: string;
  label: string;
  type: string;
  description: string;
  optional?: boolean;
  flow?: boolean;
}

export interface NodeExtensionSpec extends NodeSettingSpec {
  advanced?: boolean;
  group?: string;
}

export interface NodeVariant {
  key: string;
  label: string;
  default?: boolean;
  description?: string;
}

export interface IOPortSpec {
  id: string;
  side: "input" | "output";
  label: string;
  icon?: string;
  type?: string;
  required?: boolean;
  dynamic?: boolean;
  preview?: boolean;
}

export interface NodeMeta {
  kind: string;
  title: string;
  acronym?: string;
  icon?: string;
  family: NodeFamily;
  category?: string;
  color?: string;
  availability?: NodeAvailability;
  defaultSettings: NodeSettingSpec[];
  defaultInputs?: NodeIODetail[];
  defaultOutputs?: NodeIODetail[];
  editableExtensions?: NodeExtensionSpec[];
  variants?: NodeVariant[];
  defaultVariant?: string;
  ports: IOPortSpec[];
  autoExpand?: boolean;
  docs: {
    summary: string;
    usage: string;
    inputs?: string;
    outputs?: string;
    notes?: string;
  };
  shortcuts?: { [action: string]: string };
  codegen?: {
    emitter: string;
    template?: string;
  };
}
