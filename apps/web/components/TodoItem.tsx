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
  const isPending = isUpdating || isDeleting;

  const handleToggle = useCallback(() => {
    updateTodo({
      id: todo.id,
      data: { status: isComplete ? "TODO" : "COMPLETE" },
    });
  }, [todo.id, isComplete, updateTodo]);

  const handleDelete = useCallback(() => {
    deleteTodo(todo.id);
  }, [todo.id, deleteTodo]);

  return (
    <div
      className={[
        // Surface card
        "group flex items-center gap-md",
        "bg-bg-surface border border-border-default rounded-card",
        "px-lg py-md shadow-card",
        // Hover: soft background shift
        "hover:bg-bg-hover",
        // Transitions
        "transition-colors duration-150",
        // Completed: reduced opacity
        isComplete ? "opacity-60" : "opacity-100",
      ].join(" ")}
    >
      {/* Custom checkbox */}
      <button
        role="checkbox"
        aria-checked={isComplete}
        aria-label={`Mark "${todo.title}" as ${isComplete ? "incomplete" : "complete"}`}
        onClick={handleToggle}
        disabled={isPending}
        className={[
          "flex-shrink-0 w-5 h-5 rounded-checkbox border-2",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1",
          "transition-colors duration-150 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isComplete
            ? "bg-success border-success"
            : "bg-transparent border-border-default hover:border-accent-primary",
        ].join(" ")}
      >
        {isComplete && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Title */}
      <span
        className={[
          "flex-1 text-base select-none",
          "transition-colors duration-200",
          isComplete
            ? "line-through text-text-secondary"
            : "text-text-primary",
        ].join(" ")}
      >
        {todo.title}
      </span>

      {/* Hover-reveal delete button */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Delete "${todo.title}"`}
        className={[
          // Always keyboard-accessible (opacity, not display:none)
          "flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md",
          "text-text-secondary hover:text-danger hover:bg-red-50",
          "focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-1",
          // Hide by default, reveal on group hover
          "opacity-0 group-hover:opacity-100",
          // Always visible on touch/mobile
          "sm:opacity-0 sm:group-hover:opacity-100",
          "transition-opacity duration-150",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
});
