import { useEffect, useRef, useState } from 'react';
import { EditorLayout } from './components/layout/EditorLayout';
import './components/theme/DarkTheme.css';
import { useFileStore } from './state/fileStore';
import { DEFAULT_FILE_TREE, DEFAULT_WORKSPACE_ID } from './state/defaultFileTree';

/**
 * Entry point for the Screeps visual IDE prototype.
 */
export const App = () => {
  const [output, setOutput] = useState('');
  const initializedRef = useRef(false);
  const initWorkspace = useFileStore((state) => state.initWorkspace);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    initWorkspace(DEFAULT_WORKSPACE_ID, DEFAULT_FILE_TREE);
  }, [initWorkspace]);

  return <EditorLayout output={output} onOutputChange={setOutput} />;
};
