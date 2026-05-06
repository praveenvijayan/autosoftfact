"use client";

import { memo, useCallback } from "react";
import type { Todo } from "@paraymd/types";
import { useUpdateTodo } from "@/hooks/useUpdateTodo";
import { useDeleteTodo } from "@/hooks/useDeleteTodo";

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = memo(function TodoItem({ todo }: TodoItemProps) {
  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const isComplete = todo.status === "COMPLETE";

  // Toggle status (#29)
  const handleToggle = useCallback(() => {
    updateTodo({
      id: todo.id,
      data: { status: isComplete ? "TODO" : "COMPLETE" },
    });
  }, [todo.id, isComplete, updateTodo]);

  // Delete action (#30)
  const handleDelete = useCallback(() => {
    deleteTodo(todo.id);
  }, [todo.id, deleteTodo]);

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm mb-2 group">
      <input
        type="checkbox"
        checked={isComplete}
        onChange={handleToggle}
        disabled={isUpdating || isDeleting}
        className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-50"
        aria-label={`Mark "${todo.title}" as ${isComplete ? "incomplete" : "complete"}`}
      />
      <span
        className={`flex-1 text-sm ${
          isComplete ? "line-through text-gray-400" : "text-gray-800"
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={handleDelete}
        disabled={isUpdating || isDeleting}
        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30 text-lg leading-none"
        aria-label={`Delete "${todo.title}"`}
      >
        ×
      </button>
    </div>
  );
});
