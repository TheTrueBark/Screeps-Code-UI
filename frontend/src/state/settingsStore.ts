import { create } from "zustand";

interface SettingsState {
  movementAdapter: "Traveler" | "PathFinder" | "Simple";
  loggerEnabled: boolean;
  setMovementAdapter: (adapter: SettingsState["movementAdapter"]) => void;
  setLoggerEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  movementAdapter: "Traveler",
  loggerEnabled: true,
  setMovementAdapter: (adapter) => set({ movementAdapter: adapter }),
  setLoggerEnabled: (enabled) => set({ loggerEnabled: enabled }),
}));
