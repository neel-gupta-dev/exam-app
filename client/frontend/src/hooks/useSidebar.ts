"use client";

import { useState, useEffect } from "react";

/**
 * Global Sidebar Collapse State Hook
 * Reads and writes the sidebar minimization state to localStorage.
 * Listens for 'sidebarToggled' custom window event to ensure instantaneous
 * synchronization across isolated layout components (TopNav, Sidebar, DashboardLayout).
 */
export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    // Listener for cross-component updates
    const handler = () => setIsCollapsed(localStorage.getItem('sidebar_collapsed') === 'true');
    window.addEventListener('sidebarToggled', handler);
    return () => window.removeEventListener('sidebarToggled', handler);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    localStorage.setItem('sidebar_collapsed', nextState.toString());
    window.dispatchEvent(new Event('sidebarToggled'));
  };

  return { isCollapsed, toggleSidebar };
}
