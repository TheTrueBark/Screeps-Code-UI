import type { NodeIR } from '@shared/types';
import type { EmitContext } from './support';

const scopeAccess = (scope: unknown): { base: string; init?: string } => {
  switch (scope) {
    case 'room':
      return { base: 'Memory.rooms[creep.room.name]', init: 'Memory.rooms[creep.room.name] = Memory.rooms[creep.room.name] ?? {} as any;' };
    case 'creep':
      return { base: 'Memory.creeps[creep.name]', init: 'Memory.creeps[creep.name] = Memory.creeps[creep.name] ?? {} as any;' };
    default:
      return { base: 'Memory' };
  }
};

const buildAccess = (base: string, path: string[]): string => {
  if (path.length === 0) {
    return base;
  }
  return `${base}${path.map((segment) => `[${JSON.stringify(segment)}]`).join('')}`;
};

const ensureIntermediateObjects = (ctx: EmitContext, base: string, path: string[]) => {
  path.forEach((_, index) => {
    const partial = buildAccess(base, path.slice(0, index + 1));
    ctx.pushStatement(`if (${partial} == null) { ${partial} = {} as any; }`);
  });
};

export const emitMemoryRead = (node: NodeIR, ctx: EmitContext, emitNext: (nextId: string) => void) => {
  const scope = scopeAccess(node.config.scope);
  const rawPath = typeof node.config.path === 'string' ? node.config.path : '';
  const segments = rawPath.split('.').map((segment) => segment.trim()).filter(Boolean);
  if (scope.init) {
    ctx.pushStatement(scope.init);
  }
  const access = buildAccess(scope.base, segments);
  const fallback = typeof node.config.defaultValue === 'string' ? node.config.defaultValue : 'undefined';
  const resultVar = ctx.newTemp('memValue');
  ctx.pushStatement(`const ${resultVar} = ${access} ?? ${fallback};`);
  ctx.setValue(node.id, resultVar);
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitMemoryWrite = (node: NodeIR, ctx: EmitContext, emitNext: (nextId: string) => void) => {
  const scope = scopeAccess(node.config.scope);
  const rawPath = typeof node.config.path === 'string' ? node.config.path : '';
  const segments = rawPath.split('.').map((segment) => segment.trim()).filter(Boolean);
  const valueExpr = ctx.resolvePort(node.id, node.inputs.value, 'undefined');
  if (scope.init) {
    ctx.pushStatement(scope.init);
  }
  if (segments.length > 0) {
    ensureIntermediateObjects(ctx, scope.base, segments.slice(0, -1));
  }
  const targetAccess = buildAccess(scope.base, segments);
  if (node.config.merge) {
    ctx.pushStatement(`${targetAccess} = { ...(${targetAccess} ?? {}), ...(${valueExpr}) };`);
  } else {
    ctx.pushStatement(`${targetAccess} = ${valueExpr};`);
  }
  node.outputs.forEach((targetId) => emitNext(targetId));
};

export const emitMemoryDelete = (node: NodeIR, ctx: EmitContext, emitNext: (nextId: string) => void) => {
  const scope = scopeAccess(node.config.scope);
  const rawPath = typeof node.config.path === 'string' ? node.config.path : '';
  const segments = rawPath.split('.').map((segment) => segment.trim()).filter(Boolean);
  if (scope.init) {
    ctx.pushStatement(scope.init);
  }
  const targetAccess = buildAccess(scope.base, segments);
  ctx.pushStatement(`delete ${targetAccess};`);
  node.outputs.forEach((targetId) => emitNext(targetId));
};
