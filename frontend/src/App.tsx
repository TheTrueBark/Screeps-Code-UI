import { useState } from 'react';
import { EditorLayout } from './components/layout/EditorLayout';
import './components/theme/DarkTheme.css';

/**
 * Entry point for the Screeps visual IDE prototype.
 */
export const App = () => {
  const [output, setOutput] = useState('');

  return <EditorLayout output={output} onOutputChange={setOutput} />;
};
