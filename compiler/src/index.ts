import { Project, QuoteKind } from 'ts-morph';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import type { GraphDefinition, CompilerOptions } from '@shared/types';

// Fallback-Graph, der verwendet wird, wenn noch kein Graph aus dem Frontend
// übergeben wurde. So lässt sich der Compiler standalone testen.
const defaultGraph: GraphDefinition = {
  nodes: [
    {
      id: 'if-node',
      type: 'if',
      position: { x: 0, y: 0 },
      data: { label: 'Check energy > 50' }
    },
    {
      id: 'action-node',
      type: 'action',
      position: { x: 200, y: 100 },
      data: { label: 'Harvest Source' }
    }
  ],
  edges: [
    {
      id: 'if-to-action',
      source: 'if-node',
      target: 'action-node'
    }
  ]
};

// Wandelt einen Graphen in eine TypeScript-Datei um. Noch handelt es sich nur um
// Mock-Code, doch die Struktur (Project, SourceFile) lässt sich später erweitern.
export const compileGraph = async (
  graph: GraphDefinition = defaultGraph,
  options: CompilerOptions = { outFile: 'dist/generated.ts' }
) => {
  const project = new Project({
    useInMemoryFileSystem: true,
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  });

  const sourceFile = project.createSourceFile('workflow.ts', '', { overwrite: true });

  sourceFile.addStatements([
    `// Auto-generated Screeps workflow mock`,
    `export const workflow = () => {`,
    `  console.log('compiled from graph with', ${graph.nodes.length}, 'nodes');`,
    `};`
  ]);

  const output = sourceFile.getFullText();
  const absoluteOutFile = resolve(process.cwd(), options.outFile);
  await mkdir(dirname(absoluteOutFile), { recursive: true });
  await writeFile(absoluteOutFile, output, 'utf8');
  return output;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  compileGraph()
    .then((code) => {
      console.log(code);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
