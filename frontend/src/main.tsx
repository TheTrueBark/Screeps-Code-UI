import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { applyTheme } from './components/theme/theme';

// Dark Mode ist der Standard. Die Klasse wird direkt auf das <html>-Element gesetzt,
// damit Tailwind (darkMode: 'class') die richtigen Styles aktiviert.
document.documentElement.classList.add('dark');
applyTheme();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
