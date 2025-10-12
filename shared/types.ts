export type PortRef =
  | { refType: 'edge'; fromNodeId: string; port: string }
  | { refType: 'literal'; value: unknown };

export interface NodeIR {
  id: string;
  kind:
    | 'flow.start'
    | 'flow.if'
    | 'flow.switch'
    | 'flow.loop'
    | 'flow.try'
    | 'flow.return'
    | 'flow.break'
    | 'flow.continue'
    | 'flow.schedule'
    | 'flow.split'
    | 'flow.merge'
    | 'query.find'
    | 'query.resolveById'
    | 'query.neighborhood'
    | 'query.sortBest'
    | 'creep.move'
    | 'creep.harvest'
    | 'creep.transfer'
    | 'creep.withdraw'
    | 'creep.build'
    | 'creep.repair'
    | 'creep.upgrade'
    | 'creep.attack'
    | 'creep.heal'
    | 'structure.spawn'
    | 'structure.tower'
    | 'structure.linkSend'
    | 'structure.terminalMarket'
    | 'memory.read'
    | 'memory.write'
    | 'memory.delete'
    | 'task.define'
    | 'task.call';
  inputs: Record<string, PortRef>;
  outputs: string[];
  slots?: Record<string, string[]>;
  config: Record<string, unknown>;
}

export interface FileIR {
  fileId: string;
  entryNodeId: string;
  nodes: NodeIR[];
  taskDefs?: Array<{
    name: string;
    params: Array<{ key: string; type: string; default?: unknown }>;
    entryNodeId: string;
  }>;
}

export interface GraphNodeData extends Record<string, unknown> {
  kind: NodeIR['kind'];
  label: string;
  family:
    | 'flow'
    | 'query'
    | 'creep'
    | 'structure'
    | 'memory'
    | 'task';
  config: Record<string, unknown>;
  errors?: string[];
  warnings?: string[];
}

export interface XyflowSnapshot {
  nodes: Array<{
    id: string;
    type?: string;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges: Array<{
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }>;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: GraphNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface GraphState {
  version: number;
  xyflow: XyflowSnapshot;
  updatedAt: number;
}

export interface CompilerResult {
  code: string;
  errors: Array<{ nodeId?: string; message: string }>;
  warnings: Array<{ nodeId?: string; message: string }>;
}
