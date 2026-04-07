import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

/**
 * Point d'entrée de l'application ZéroVirguleChance
 *
 * StrictMode activé pour détecter les effets de bord pendant le développement
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
