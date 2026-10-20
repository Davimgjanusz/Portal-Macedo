'use client';

import { createContext, useContext } from 'react';

export const DashboardContext = createContext(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard deve ser usado dentro do DashboardShell');
  return ctx;
}
