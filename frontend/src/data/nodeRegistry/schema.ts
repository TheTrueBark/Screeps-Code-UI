export type NodeFamily =
  | "flow"
  | "query"
  | "creep"
  | "structure"
  | "memory"
  | "task";

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
