"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTodo } from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";
import { TODO_QUERY_KEY } from "./useTodos";

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEY });
      const previous = queryClient.getQueryData<Todo[]>(TODO_QUERY_KEY);

      queryClient.setQueryData<Todo[]>(TODO_QUERY_KEY, (old = []) =>
        old.filter((t) => t.id !== id)
      );

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
