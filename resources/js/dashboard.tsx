import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from '@/components/dashboard/Dashboard';
import '../css/app.css';

const rootElement = document.getElementById('dashboard-root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Dashboard />
    </StrictMode>,
  );
}
