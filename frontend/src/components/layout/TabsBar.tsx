import { useCallback, type KeyboardEvent, type MouseEvent } from 'react';
import { useFileStore } from '../../state/fileStore';
import { cn } from '../../utils/classNames';

/**
 * Displays open file tabs similar to VSCode.
 */
export const TabsBar = () => {
  const openTabs = useFileStore((state) => state.openTabs);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const closeTab = useFileStore((state) => state.closeTab);

  const handleSelect = useCallback(
    (fileId: string) => () => {
      setActiveFile(fileId);
    },
    [setActiveFile]
  );

  const handleClose = useCallback(
    (fileId: string) => (
      event?: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>
    ) => {
      event?.stopPropagation();
      closeTab(fileId);
    },
    [closeTab]
  );

  return (
    <div className="tabs-bar">
      {openTabs.length === 0 ? (
        <div className="px-4 text-sm text-slate-400">Open a file to begin editing.</div>
      ) : (
        openTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={handleSelect(tab.id)}
            className={cn('tab-button', { active: tab.id === activeFileId })}
          >
            <span className="truncate">{tab.name}</span>
            <span
              role="button"
              tabIndex={0}
              className="tab-close"
              onClick={(event) => handleClose(tab.id)(event)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleClose(tab.id)(event);
                }
              }}
              aria-label={`Close ${tab.name}`}
            >
              ×
            </span>
          </button>
        ))
      )}
    </div>
  );
};
