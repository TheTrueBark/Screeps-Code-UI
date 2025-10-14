import type { NodeIR } from "@shared/types";
import type { NodeProps } from "@xyflow/react";
import type { NodeFamily } from "../../../data/nodeRegistry/schema";

type ConfigFieldBase = {
  name: string;
  label: string;
  helper?: string;
  visible?: (config: Record<string, unknown>) => boolean;
};

export type ConfigField =
  | (ConfigFieldBase & {
      type: "text";
      placeholder?: string;
    })
  | (ConfigFieldBase & {
      type: "number";
      min?: number;
      max?: number;
      step?: number;
    })
  | (ConfigFieldBase & {
      type: "select";
      options: Array<{ value: string; label: string }>;
    })
  | (ConfigFieldBase & {
      type: "checkbox";
    })
  | (ConfigFieldBase & {
      type: "json";
      rows?: number;
    });

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
