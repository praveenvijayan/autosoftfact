"use client";

import { useQuery } from "@tanstack/react-query";
import { getTodos } from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";

export const TODO_QUERY_KEY = ["todos"] as const;

export function useTodos() {
  return useQuery({
    queryKey: TODO_QUERY_KEY,
    queryFn: async () => {
      const res = await getTodos();
      if (res.error) throw new Error(res.error);
      return res.data as Todo[];
    },
  });
}
