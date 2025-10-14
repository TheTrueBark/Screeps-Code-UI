import { useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { useFileStore } from "../../state/fileStore";
import { cn } from "../../utils/classNames";

type TabsBarProps = {
  className?: string;
};

/**
 * Displays open file tabs similar to VSCode.
 */
export const TabsBar = ({ className }: TabsBarProps) => {
  const openTabs = useFileStore((state) => state.openTabs);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const closeTab = useFileStore((state) => state.closeTab);
  const saveStates = useFileStore((state) => state.saveStates);

  const handleSelect = useCallback(
    (fileId: string) => () => {
      setActiveFile(fileId);
    },
    [setActiveFile],
  );

  const handleClose = useCallback(
    (fileId: string) =>
      (
        event?: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>,
      ) => {
        event?.stopPropagation();
        closeTab(fileId);
      },
    [closeTab],
  );

  return (
    <div className={cn("tabs-bar", className)}>
      {openTabs.length === 0 ? (
        <div className="tab-placeholder">Open a file to begin.</div>
      ) : (
        openTabs.map((tab) => {
          const isActive = tab.id === activeFileId;
          const isDirty = Boolean(saveStates[tab.id]?.dirty);
          const displayName = tab.name.replace(/\.ts$/i, "");
          return (
            <button
              key={tab.id}
              type="button"
              onClick={handleSelect(tab.id)}
              className={cn("tab-chip", { active: isActive, dirty: isDirty })}
            >
              <span className="tab-chip-label">{displayName}</span>
              <span
                role="button"
                tabIndex={0}
                className="tab-chip-close"
                onClick={(event) => handleClose(tab.id)(event)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleClose(tab.id)(event);
                  }
                }}
                aria-label={`Close ${tab.name}`}
              >
                ×
              </span>
            </button>
          );
        })
      )}
    </div>
  );
};
