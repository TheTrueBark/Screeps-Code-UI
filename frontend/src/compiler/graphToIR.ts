import type { FileIR, GraphEdge, GraphNode, GraphState, NodeIR, PortRef } from '@shared/types';
import { NODE_DEFINITION_MAP } from '../components/editor/nodeRegistry';
import type { NodeDefinition } from '../components/editor/NodeTypes/types';

export interface BuildIrResult {
  file: FileIR | null;
  errors: Array<{ nodeId?: string; message: string }>;
  warnings: Array<{ nodeId?: string; message: string }>;
}

const literalRef = (value: unknown): PortRef => ({ refType: 'literal', value });

const cloneConfig = (config: Record<string, unknown> | undefined) =>
  JSON.parse(JSON.stringify(config ?? {}));

const getDefinition = (kind: string): NodeDefinition | undefined => NODE_DEFINITION_MAP[kind];

const getGraphNodes = (graph: GraphState): GraphNode[] =>
  (graph.xyflow.nodes ?? []).map((node) => ({
    id: node.id,
    type: node.type ?? '',
    position: node.position,
    data: (node.data ?? {}) as GraphNode['data']
  }));

const getGraphEdges = (graph: GraphState): GraphEdge[] =>
  (graph.xyflow.edges ?? []).map((edge) => ({
    id: edge.id ?? `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null
  }));

export const buildFileIR = (fileId: string, graph: GraphState): BuildIrResult => {
  const errors: Array<{ nodeId?: string; message: string }> = [];
  const warnings: Array<{ nodeId?: string; message: string }> = [];

  const nodes = getGraphNodes(graph);
  const edges = getGraphEdges(graph);

  if (nodes.length === 0) {
    return {
      file: null,
      errors: [{ message: 'Graph is empty. Add nodes to compile.' }],
      warnings
    };
  }

  const edgesFrom = new Map<string, GraphEdge[]>();
  const edgesTo = new Map<string, GraphEdge[]>();

  edges.forEach((edge) => {
    if (!edgesFrom.has(edge.source)) {
      edgesFrom.set(edge.source, []);
    }
    if (!edgesTo.has(edge.target)) {
      edgesTo.set(edge.target, []);
    }

    edgesFrom.get(edge.source)?.push(edge);
    edgesTo.get(edge.target)?.push(edge);
  });

  const nodeIrs: NodeIR[] = [];
  let entryNodeId: string | null = null;
  const taskDefs: FileIR['taskDefs'] = [];
  const definedTasks = new Map<string, { params: Array<{ key: string; type: string; default?: unknown }>; nodeId: string }>();

  nodes.forEach((node) => {
    const definition = getDefinition(node.data.kind);
    if (!definition) {
      errors.push({
        nodeId: node.id,
        message: `Unknown node kind "${node.data.kind}". Update the node library.`
      });
      return;
    }

    if (node.data.kind === 'flow.start') {
      if (entryNodeId) {
        errors.push({ nodeId: node.id, message: 'Only one Start node is allowed per file.' });
      } else {
        entryNodeId = node.id;
      }
    }

    const outgoing = edgesFrom.get(node.id) ?? [];
    const incoming = edgesTo.get(node.id) ?? [];

    const flowOutputs = outgoing
      .filter((edge) => !edge.sourceHandle || edge.sourceHandle === 'flow:out')
      .map((edge) => edge.target);

    const slots: Record<string, string[]> = {};
    outgoing
      .filter((edge) => edge.sourceHandle?.startsWith('slot:'))
      .forEach((edge) => {
        const slotName = edge.sourceHandle?.slice(5) ?? 'default';
        if (!slots[slotName]) {
          slots[slotName] = [];
        }
        slots[slotName].push(edge.target);
      });

    const inputs: Record<string, PortRef> = {};
    const config = cloneConfig(node.data.config as Record<string, unknown>);

    definition.dataInputs?.forEach((inputDef) => {
      const match = incoming.find((edge) => edge.targetHandle === inputDef.handleId);
      if (match) {
        inputs[inputDef.name] = {
          refType: 'edge',
          fromNodeId: match.source,
          port: match.sourceHandle ?? 'flow:out'
        };
      } else if (inputDef.configKey && config[inputDef.configKey] !== undefined) {
        inputs[inputDef.name] = literalRef(config[inputDef.configKey]);
      } else if (inputDef.optional) {
        inputs[inputDef.name] = literalRef(undefined);
      } else {
        inputs[inputDef.name] = literalRef(undefined);
        warnings.push({
          nodeId: node.id,
          message: `Input "${inputDef.label}" is not connected.`
        });
      }
    });

    const slotKeys = Object.keys(slots);
    const nodeIr: NodeIR = {
      id: node.id,
      kind:
        node.data.kind === 'flow.break' && config.mode === 'continue'
          ? 'flow.continue'
          : (node.data.kind as NodeIR['kind']),
      inputs,
      outputs: flowOutputs,
      slots: slotKeys.length > 0 ? slots : undefined,
      config
    };

    nodeIrs.push(nodeIr);

    if (nodeIr.kind === 'task.define') {
      const name = typeof config.taskName === 'string' && config.taskName.trim().length > 0 ? config.taskName.trim() : undefined;
      if (!name) {
        errors.push({ nodeId: node.id, message: 'Task definition requires a task name.' });
      }

      const params = Array.isArray(config.params)
        ? (config.params as Array<{ key: string; type: string; default?: unknown }>).
            filter((param) => typeof param?.key === 'string' && typeof param?.type === 'string')
        : [];

      const bodyEntry = nodeIr.slots?.body?.[0];
      if (!bodyEntry) {
        warnings.push({ nodeId: node.id, message: 'Task has no body branch.' });
      }

      if (name) {
        definedTasks.set(name, { params, nodeId: node.id });
        taskDefs?.push({ name, params, entryNodeId: bodyEntry ?? '' });
      }
    }
  });

  const callsNeedingValidation = nodeIrs.filter((node) => node.kind === 'task.call');
  callsNeedingValidation.forEach((node) => {
    const taskName = typeof node.config.taskName === 'string' ? node.config.taskName : undefined;
    if (!taskName) {
      errors.push({ nodeId: node.id, message: 'Task call is missing a task name.' });
      return;
    }

    if (!definedTasks.has(taskName)) {
      errors.push({ nodeId: node.id, message: `Task "${taskName}" is not defined in this file.` });
    }
  });

  if (!entryNodeId) {
    errors.push({ message: 'Each file must include a Start node.' });
  }

  if (errors.length > 0) {
    return { file: null, errors, warnings };
  }

  return {
    file: {
      fileId,
      entryNodeId: entryNodeId!,
      nodes: nodeIrs,
      taskDefs: taskDefs && taskDefs.length > 0 ? taskDefs : undefined
    },
    errors,
    warnings
  };
};
