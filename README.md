# Screeps Visual Workflow Tool (MVP)

Dieses Repository enthält ein erstes Gerüst für ein visuelles Workflow-Tool, das Screeps-Spielern dabei hilft, Automatisierungslogik per Node-Editor zu erstellen. Das Projekt ist so aufgebaut, dass es später zu einem vollwertigen visuellen Baukasten mit Code-Generierung ausgebaut werden kann.

## Schnellstart

```bash
npm install
npm run dev
```

- `npm install` installiert die Abhängigkeiten für Frontend und Compiler (Workspaces).
- `npm run dev` startet die Vite-Entwicklungsumgebung im Ordner `frontend` (http://localhost:5173).

## Projektstruktur

```
.
├── frontend/            # React 18 + Vite + Tailwind + Xyflow
├── compiler/            # Mock-Code-Generator (ts-morph vorbereitet)
├── shared/              # Gemeinsame Typdefinitionen
├── package.json         # Workspace-Konfiguration & Skripte
├── tsconfig.json        # Gemeinsame TS-Einstellungen
├── tailwind.config.js   # Dark-Mode-konfigurierter Tailwind Build
└── README.md
```

## Arbeitsstände je Datei

Der Node-Editor speichert für jede Datei im linken Baum einen eigenen Graph-Zustand
(Nodes, Edges, Viewport) unter `localStorage`. Der Namespace lautet
`sv_ide:<workspaceId>:...`, wobei die Workspace-ID derzeit `screeps-dev` ist.

- Beim Dateiwechsel wird der aktuelle Canvas-Stand automatisch gesichert und beim
  erneuten Öffnen wiederhergestellt.
- Beim Refresh oder Browser-Neustart lädt die App den zuletzt geöffneten Tab sowie
  alle gespeicherten Graphen wieder.

Um die gespeicherten Zustände zurückzusetzen, können die entsprechenden Keys im
`localStorage` entfernt werden.

## Eigene Nodes erstellen

Custom Nodes werden im Ordner [`frontend/src/components/nodes`](frontend/src/components/nodes) abgelegt. Jede Datei exportiert sowohl ein React-Komponent für die Darstellung im Canvas als auch optionale Konfigurationsdaten (z. B. Default-Ports). Registriere den Node in `FlowCanvas.tsx`, damit Xyflow ihn kennt.

## Code-Generierung

Die spätere Code-Generierung läuft über den Workspace `compiler`. Für das MVP gibt es den Befehl:

```bash
npm run build:compiler
```

Dieser ruft intern `npm run build` im Ordner `compiler` auf. Der aktuelle Mock nutzt `ts-morph`, um eine TypeScript-Datei mit Debug-Ausgabe zu erstellen. In zukünftigen Iterationen wird hier der Graph aus dem Frontend in echte Screeps-Routinen übersetzt.

## Dark Mode

Tailwind ist mit `darkMode: 'class'` konfiguriert. Standardmäßig aktiviert `frontend/src/main.tsx` den Dark Mode, indem es die Klasse `dark` auf das `<html>`-Element setzt. Wer stattdessen das System-Theme verwenden möchte, kann diese Zeile entfernen und Tailwind automatisch per Media Query arbeiten lassen.

Viel Spaß beim weiteren Ausbau! ✨
