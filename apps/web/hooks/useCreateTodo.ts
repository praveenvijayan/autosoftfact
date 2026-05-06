"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodo } from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";
import { TODO_QUERY_KEY } from "./useTodos";

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createTodo(title),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEY });
      const previous = queryClient.getQueryData<Todo[]>(TODO_QUERY_KEY);

      const optimistic: Todo = {
        id: `temp-${Date.now()}`,
        title,
        status: "TODO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Todo[]>(TODO_QUERY_KEY, (old = []) => [
        optimistic,
        ...old,
      ]);

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(TODO_QUERY_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
    },
  });
}
