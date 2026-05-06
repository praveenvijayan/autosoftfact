"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Performance defaults for all queries in this app:
//
// staleTime: 30 s  — data is considered fresh for 30 seconds after it arrives,
//   which prevents redundant background refetches when the user navigates between
//   pages or components re-mount within the same session.
//
// gcTime: 5 min  — unused cache entries are held in memory for 5 minutes before
//   being garbage-collected, allowing instant re-renders if the user returns to a
//   previously visited view within that window.
//
// refetchOnWindowFocus: false  — for a task-management app the user controls
//   mutations explicitly; silently re-fetching on every alt-tab creates flicker
//   without meaningful data-freshness benefit.
//
// retry: 1  — one automatic retry on transient network errors before surfacing
//   the failure to the UI, keeping the error boundary from firing on a blip.

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
