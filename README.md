# Screeps Visual Workflow Tool (MVP)

This repository contains the first iteration of a visual workflow builder for Screeps players.
It provides a node-based editor that will later evolve into a fully-fledged visual toolkit with
code generation capabilities. The current milestone focuses on establishing a solid editing
experience and a shared type system between the UI and the compiler workspace.

## Quick start

```bash
npm install
npm run dev
```

- `npm install` installs dependencies for both the frontend and compiler workspaces.
- `npm run dev` starts the Vite dev server for the frontend on http://localhost:5173.

## Project structure

```
.
├── frontend/            # React 18 + Vite application with the node editor UI
│   └── src/
│       ├── components/editor/   # Canvas editor, node renderer, catalog, toolbar
│       ├── components/theme/    # Dark theme styles used across the app
│       ├── data/                # Node metadata and documentation registry
│       └── state/               # Zustand stores for files, settings, etc.
├── compiler/            # Placeholder workspace for future code generation
├── shared/              # Shared TypeScript types consumed by both workspaces
├── package.json         # Workspace configuration and root scripts
├── tsconfig.json        # Shared TypeScript settings
├── tailwind.config.js   # Tailwind build configured for dark mode
└── README.md
```

## Editor overview

- **Canvas & grid** – Nodes snap to a 24px grid. The rendered grid scales with zoom to keep the
  visual rhythm consistent while panning or zooming.
- **Category bar** – A persistent bottom menu exposes node families (Flow, Query, Creep, etc.).
  Selecting a category opens the catalog drawer with node tiles and keyboard hints.
- **Zoom controls** – Floating zoom buttons sit above the bottom edge with generous padding so
  they do not collide with the catalog. Fit-to-view is still available for quick recentering.
- **Compact nodes** – Node headers now show the primary title with the category badge on the
  right. Rows grow vertically to avoid truncating long labels or configuration values.

## Graph persistence

Each file in the left-hand explorer stores its own graph (nodes, edges, viewport) in
`localStorage` under the namespace `sv_ide:<workspaceId>:...` (`workspaceId` currently defaults to
`screeps-dev`).

- Switching files automatically saves the current canvas and restores it when revisiting a file.
- Reloading the browser reopens the last active tab and rehydrates every saved graph state.
- To clear progress, remove the relevant keys from `localStorage` via the browser dev tools.

## Creating custom nodes

Node definitions live in [`frontend/src/components/editor/NodeTypes`](frontend/src/components/editor/NodeTypes).
Each module exports a definition object that describes ports, configuration rows, defaults, and
documentation metadata. Register new nodes inside
[`frontend/src/components/editor/nodeRegistry.ts`](frontend/src/components/editor/nodeRegistry.ts)
so the catalog, renderer, and documentation pick them up automatically.

## Code generation

The `compiler` workspace will eventually translate graphs into executable Screeps scripts. For
now it contains a placeholder build that demonstrates how `ts-morph` can be used:

```bash
npm run build:compiler
```

The command runs `npm run build` in the `compiler` workspace and emits a mock TypeScript file with
debug output. Future milestones will feed the serialized graphs into this pipeline.

## Theming

Tailwind is configured with `darkMode: 'class'`. The frontend bootstraps the dark theme by adding
the `dark` class to `<html>`. Remove that line if you prefer to defer to the user's system theme
and let Tailwind pick it up via media queries.

Happy hacking and have fun automating your Screeps colony! ✨
