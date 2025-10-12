import type { NodeFamily, NodeMeta } from "./schema";
import * as flowControl from "./flowControl";
import * as queryTargeting from "./queryTargeting";
import * as creepActions from "./creepActions";
import * as structureLogic from "./structureLogic";
import * as economyMarket from "./economyMarket";
import * as power from "./power";
import * as memoryData from "./memoryData";
import * as mapNavigation from "./mapNavigation";
import * as globalGame from "./globalGame";
import * as taskMacro from "./taskMacro";

const REGISTRY: Record<string, NodeMeta> = {
  ...flowControl.nodes,
  ...queryTargeting.nodes,
  ...creepActions.nodes,
  ...structureLogic.nodes,
  ...economyMarket.nodes,
  ...power.nodes,
  ...memoryData.nodes,
  ...mapNavigation.nodes,
  ...globalGame.nodes,
  ...taskMacro.nodes,
};

export const listAllMeta = (): NodeMeta[] => Object.values(REGISTRY);

export const getNodeMeta = (kind: string): NodeMeta | undefined =>
  REGISTRY[kind];

export const getNodeMetaOrThrow = (kind: string): NodeMeta => {
  const meta = getNodeMeta(kind);
  if (!meta) {
    throw new Error(`Unknown node kind: ${kind}`);
  }
  return meta;
};

export const listByFamily = (family: NodeFamily): NodeMeta[] =>
  listAllMeta().filter((meta) => meta.family === family);

export const getDocMarkdown = (kind: string): string => {
  const meta = getNodeMeta(kind);
  if (!meta) {
    return "";
  }

  const sections: string[] = [];
  if (meta.docs.summary) {
    sections.push(meta.docs.summary.trim());
  }
  if (meta.docs.usage) {
    sections.push(meta.docs.usage.trim());
  }
  if (meta.docs.inputs) {
    sections.push(`**Inputs**\n${meta.docs.inputs.trim()}`);
  }
  if (meta.docs.outputs) {
    sections.push(`**Outputs**\n${meta.docs.outputs.trim()}`);
  }
  if (meta.docs.notes) {
    sections.push(`**Notes**\n${meta.docs.notes.trim()}`);
  }

  return sections.join("\n\n");
};

export default REGISTRY;
