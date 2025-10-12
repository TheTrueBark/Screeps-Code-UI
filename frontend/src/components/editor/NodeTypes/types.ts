import type { NodeIR } from "@shared/types";
import type { NodeProps } from "@xyflow/react";
import type { NodeFamily } from "../../../data/nodeRegistry/schema";

export type ConfigField =
  | {
      type: "text";
      name: string;
      label: string;
      placeholder?: string;
      helper?: string;
    }
  | {
      type: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      step?: number;
      helper?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      options: Array<{ value: string; label: string }>;
      helper?: string;
    }
  | {
      type: "checkbox";
      name: string;
      label: string;
      helper?: string;
    }
  | {
      type: "json";
      name: string;
      label: string;
      helper?: string;
      rows?: number;
    };

export interface SlotDefinition {
  name: string;
  label: string;
}

export interface DataInputDefinition {
  name: string;
  label: string;
  handleId: string;
  optional?: boolean;
  configKey?: string;
}

export interface DataOutputDefinition {
  name: string;
  label: string;
  handleId: string;
}

export interface NodeDefinition {
  kind: NodeIR["kind"];
  type: string;
  title: string;
  subtitle?: string;
  description: string;
  family: NodeFamily;
  category: string;
  defaultConfig: Record<string, unknown>;
  configFields: ConfigField[];
  hasFlowInput?: boolean;
  hasFlowOutput?: boolean;
  slots?: SlotDefinition[];
  dataInputs?: DataInputDefinition[];
  dataOutputs?: DataOutputDefinition[];
  Component: (props: NodeProps) => JSX.Element;
}
