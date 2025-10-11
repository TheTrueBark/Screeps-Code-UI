import { useCallback, useState } from 'react';
import { FlowCanvas } from './components/FlowCanvas';
import { useGraphStore } from './store/graphStore';
import { generateCodeFromGraph } from './utils/generateCode';
import { Sidebar } from './components/panels/Sidebar';

export const App = () => {
  const toSerializableGraph = useGraphStore((state) => state.toSerializableGraph);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const handleGenerate = useCallback(async () => {
    const graph = toSerializableGraph();
    // Übergibt den serialisierten Graph an die (noch simulierte) Compiler-Bridge.
    const result = await generateCodeFromGraph(graph);
    setGeneratedCode(result);
  }, [toSerializableGraph]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-slate-800 bg-slate-950/70 px-6 py-4">
        <h1 className="text-2xl font-semibold text-slate-100">
          Screeps Workflow Builder
        </h1>
        <p className="text-sm text-slate-400">
          Baue spielerische Automatisierung durch visuelle Graphen.
        </p>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-6 lg:flex-row">
        <section className="flex-1">
          <FlowCanvas />
        </section>
        <aside className="w-full max-w-sm space-y-4 rounded-lg border border-slate-800 bg-slate-900/80 p-4">
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
          >
            Generate Code
          </button>
          <Sidebar />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Output (Mock)
            </h2>
            <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-slate-950/60 p-3 text-xs text-emerald-200">
              {generatedCode || '// Press "Generate Code" to serialize the graph'}
            </pre>
          </div>
        </aside>
      </main>
    </div>
  );
};
