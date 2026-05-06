import { ReactNode } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * AppShell — full-page layout: sidebar (desktop) + main content.
 *
 * Responsive behaviour:
 *   mobile  (< md) : sidebar hidden, full-width content
 *   desktop (≥ md) : fixed 224px sidebar + fluid content
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar — hidden on mobile */}
      <aside
        className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-bg-primary border-r border-border-default"
        aria-label="App navigation"
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
