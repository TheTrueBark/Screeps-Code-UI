import type { GraphDefinition } from '@shared/types';

/**
 * Simuliert den Aufruf des Compiler-Workspaces. In einer späteren Ausbaustufe
 * wird dieser Helper eine echte API oder CLI-Funktion aufrufen.
 */
export const generateCodeFromGraph = async (
  graph: GraphDefinition
): Promise<string> => {
  try {
    const response = await fetch('/api/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graph)
    });

    if (!response.ok) {
      throw new Error('Compiler API not available yet. Using mock output.');
    }

    const { code } = await response.json();
    return code as string;
  } catch (error) {
    console.info('[Mock Compiler]', error);
    return `// Mock compiler output\nconsole.log('compiled');`;
  }
};
