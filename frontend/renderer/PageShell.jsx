import React from 'react';
import App from '../src/App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';

export function PageShell({ url }) {
  const Router = import.meta.env.SSR ? StaticRouter : BrowserRouter;
  const routerProps = import.meta.env.SSR ? { location: url } : {};
  return (
    <Router {...routerProps}>
      <App />
    </Router>
  );
} 