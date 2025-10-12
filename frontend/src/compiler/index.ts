import type { CompilerResult, GraphState } from "@shared/types";
import { compileGraphToCode } from "./emit";

export const compileGraph = (
  fileId: string,
  graph: GraphState,
): CompilerResult => compileGraphToCode(fileId, graph);
