"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { useTodos } from "@/hooks/useTodos";
import { TodoItem } from "./TodoItem";
import type { TodoStatus } from "@paraymd/types";

type Filter = "ALL" | TodoStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "ALL" },
  { label: "Todo", value: "TODO" },
  { label: "Complete", value: "COMPLETE" },
];

export const TodoList = memo(function TodoList() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data: todos, isLoading, isError, error } = useTodos();

  const handleFilterChange = useCallback((f: Filter) => setFilter(f), []);

  // Filter todos (#35)
  const filtered = useMemo(
    () =>
      todos
        ? filter === "ALL"
          ? todos
          : todos.filter((t) => t.status === filter)
        : [],
    [todos, filter]
  );

  return (
    <div>
      {/* Filter buttons (#35) */}
      <div className="flex gap-2 mb-4" role="group" aria-label="Filter todos">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              filter === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading state (#31) */}
      {isLoading && (
        <div aria-label="Loading todos" role="status">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-lg h-12 mb-2"
            />
          ))}
        </div>
      )}

      {/* Error state (#31) */}
      {isError && (
        <div
          className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-3 text-sm"
          role="alert"
        >
          Failed to load todos:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10 text-sm">
          {filter === "ALL"
            ? "No todos yet. Add one above!"
            : `No ${filter.toLowerCase()} todos.`}
        </p>
      )}

      {/* Todo items */}
      {filtered.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
});
