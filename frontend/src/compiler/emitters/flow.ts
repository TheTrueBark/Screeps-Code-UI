import type { NodeIR } from '@shared/types';
import type { EmitContext } from './support';

export const emitStart = (node: NodeIR, ctx: EmitContext, emitNext: (nextId: string) => void) => {
  node.outputs.forEach((target) => emitNext(target));
};

export const emitIf = (
  node: NodeIR,
  ctx: EmitContext,
  emitBranch: (nodes: string[]) => void,
  emitNext: (nextId: string) => void
) => {
  const condExpr = ctx.resolvePort(node.id, node.inputs.cond, node.config.condition ?? 'false');
  const trueBranch = node.slots?.true ?? [];
  const falseBranch = node.slots?.false ?? [];

  ctx.withBlock(`if (${condExpr})`, () => {
    emitBranch(trueBranch);
  });

  if (falseBranch.length > 0) {
    ctx.pushStatement('else {');
    ctx.enterScope();
    emitBranch(falseBranch);
    ctx.exitScope();
    ctx.pushStatement('}');
  }

  node.outputs.forEach((target) => emitNext(target));
};

export const emitSwitch = (
  node: NodeIR,
  ctx: EmitContext,
  emitBranch: (nodes: string[]) => void,
  emitNext: (nextId: string) => void
) => {
  const keyExpr = ctx.resolvePort(node.id, node.inputs.key, node.config.key ?? 'undefined');
  const cases = Array.isArray(node.config.cases) ? (node.config.cases as Array<{ label?: string; matchValue: unknown }>) : [];

  ctx.pushStatement(`switch (${keyExpr}) {`);
  ctx.enterScope();

  cases.forEach((caseConfig, index) => {
    const slotName = `case-${index}`;
    const branch = node.slots?.[slotName] ?? [];
    const label = caseConfig.matchValue !== undefined ? JSON.stringify(caseConfig.matchValue) : 'undefined';
    ctx.pushStatement(`case ${label}:`);
    ctx.enterScope();
    ctx.pushStatement('{');
    ctx.enterScope();
    emitBranch(branch);
    ctx.pushStatement('break;');
    ctx.exitScope();
    ctx.pushStatement('}');
    ctx.exitScope();
  });

  const defaultBranch = node.slots?.default ?? [];
  ctx.pushStatement('default:');
  ctx.enterScope();
  ctx.pushStatement('{');
  ctx.enterScope();
  emitBranch(defaultBranch);
  ctx.pushStatement('break;');
  ctx.exitScope();
  ctx.pushStatement('}');
  ctx.exitScope();

  ctx.exitScope();
  ctx.pushStatement('}');

  node.outputs.forEach((target) => emitNext(target));
};

export const emitLoop = (
  node: NodeIR,
  ctx: EmitContext,
  emitBranch: (nodes: string[]) => void,
  emitNext: (nextId: string) => void
) => {
  const loopType = typeof node.config.loopType === 'string' ? node.config.loopType : 'while';
  const maxIterations = Number(node.config.maxIterations ?? 10) || 10;
  const bodyBranch = node.slots?.body ?? [];
  const elseBranch = node.slots?.else ?? [];
  const ranFlag = ctx.newTemp('loopRan');
  ctx.pushStatement(`let ${ranFlag} = false;`);

  if (loopType === 'for') {
    const iterName = typeof node.config.iterVarName === 'string' && node.config.iterVarName.trim().length > 0
      ? node.config.iterVarName.trim()
      : ctx.newTemp('i');
    ctx.pushStatement(`for (let ${iterName} = 0; ${iterName} < ${maxIterations}; ${iterName} += 1) {`);
    ctx.enterScope();
    ctx.pushStatement(`${ranFlag} = true;`);
    emitBranch(bodyBranch);
    ctx.exitScope();
    ctx.pushStatement('}');
  } else {
    const condExpr = ctx.resolvePort(node.id, node.inputs.cond, node.config.condition ?? 'true');
    const guardVar = ctx.newTemp('guard');
    ctx.pushStatement(`let ${guardVar} = 0;`);
    ctx.pushStatement(`while (${condExpr}) {`);
    ctx.enterScope();
    ctx.pushStatement(`${ranFlag} = true;`);
    emitBranch(bodyBranch);
    ctx.pushStatement(`${guardVar} += 1;`);
    ctx.pushStatement(`if (${guardVar} >= ${maxIterations}) {`);
    ctx.enterScope();
    ctx.pushStatement('break;');
    ctx.exitScope();
    ctx.pushStatement('}');
    ctx.exitScope();
    ctx.pushStatement('}');
  }

  if (elseBranch.length > 0) {
    ctx.withBlock(`if (!${ranFlag})`, () => {
      emitBranch(elseBranch);
    });
  }

  node.outputs.forEach((target) => emitNext(target));
};

export const emitTry = (
  node: NodeIR,
  ctx: EmitContext,
  emitBranch: (nodes: string[]) => void,
  emitNext: (nextId: string) => void
) => {
  const tryBranch = node.slots?.try ?? [];
  const catchBranch = node.slots?.catch ?? [];
  const finallyBranch = node.slots?.finally ?? [];
  const errorVar = typeof node.config.errorVar === 'string' && node.config.errorVar.trim().length > 0 ? node.config.errorVar : 'err';

  ctx.pushStatement('try {');
  ctx.enterScope();
  emitBranch(tryBranch);
  ctx.exitScope();
  ctx.pushStatement(`} catch (${errorVar}) {`);
  ctx.enterScope();
  if (catchBranch.length === 0) {
    ctx.pushStatement('// Swallow error by default.');
  } else {
    emitBranch(catchBranch);
  }
  ctx.exitScope();
  ctx.pushStatement('}');

  if (finallyBranch.length > 0) {
    ctx.pushStatement('finally {');
    ctx.enterScope();
    emitBranch(finallyBranch);
    ctx.exitScope();
    ctx.pushStatement('}');
  }

  node.outputs.forEach((target) => emitNext(target));
};

export const emitSchedule = (
  node: NodeIR,
  ctx: EmitContext,
  emitBranch: (nodes: string[]) => void,
  emitNext: (nextId: string) => void
) => {
  const interval = Number(node.config.interval ?? 1) || 1;
  const offset = Number(node.config.offset ?? 0) || 0;
  const mode = node.config.mode === 'modulo' ? 'modulo' : 'every';
  const bodyBranch = node.slots?.body ?? [];
  const condition =
    mode === 'modulo'
      ? `Game.time % ${interval} === ${offset}`
      : `(Game.time + ${offset}) % ${interval} === 0`;

  ctx.withBlock(`if (${condition})`, () => {
    emitBranch(bodyBranch);
  });

  node.outputs.forEach((target) => emitNext(target));
};

export const emitSplitter = (
  node: NodeIR,
  emitBranch: (nodes: string[]) => void,
  emitNext: (nextId: string) => void
) => {
  const slots = node.slots ?? {};
  Object.keys(slots)
    .sort()
    .forEach((slotName) => {
      emitBranch(slots[slotName]);
    });

  node.outputs.forEach((target) => emitNext(target));
};

export const emitMerger = (node: NodeIR, emitNext: (nextId: string) => void) => {
  node.outputs.forEach((target) => emitNext(target));
};

export const emitReturn = (node: NodeIR, ctx: EmitContext) => {
  const expr = ctx.resolvePort(node.id, undefined, node.config.value ?? 'undefined');
  ctx.pushStatement(`return ${expr};`);
};

export const emitBreak = (node: NodeIR, ctx: EmitContext) => {
  ctx.pushStatement('break;');
};

export const emitContinue = (node: NodeIR, ctx: EmitContext) => {
  ctx.pushStatement('continue;');
};
