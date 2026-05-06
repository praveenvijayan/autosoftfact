"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTodo } from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";
import { TODO_QUERY_KEY } from "./useTodos";

type UpdatePayload = { id: string; data: Partial<Pick<Todo, "title" | "status">> };

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePayload) => updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEY });
      const previous = queryClient.getQueryData<Todo[]>(TODO_QUERY_KEY);

      queryClient.setQueryData<Todo[]>(TODO_QUERY_KEY, (old = []) =>
        old.map((t) =>
          t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
        )
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
