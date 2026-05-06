"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { useTodos } from "@/hooks/useTodos";
import { TodoItem } from "./TodoItem";
import { FilterTabs, type Filter } from "./FilterTabs";
import { EmptyState } from "./EmptyState";

const FILTER_LABELS: Record<Filter, string> = {
  ALL: "All",
  TODO: "Todo",
  COMPLETE: "Complete",
};

export const TodoList = memo(function TodoList() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data: todos, isLoading, isError, error } = useTodos();

  const handleFilterChange = useCallback((f: Filter) => setFilter(f), []);

  // Compute counts per filter
  const counts = useMemo(() => {
    const all = todos?.length ?? 0;
    const complete = todos?.filter((t) => t.status === "COMPLETE").length ?? 0;
    const todo = todos?.filter((t) => t.status === "TODO").length ?? 0;
    return { ALL: all, TODO: todo, COMPLETE: complete };
  }, [todos]);

  // Build filter options with counts
  const filterOptions = useMemo(
    () =>
      (["ALL", "TODO", "COMPLETE"] as Filter[]).map((value) => ({
        label: FILTER_LABELS[value],
        value,
        count: counts[value],
      })),
    [counts]
  );

  // Filter todos
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
      {/* Filter tabs — reusable FilterTabs component */}
      <div className="mb-lg">
        <FilterTabs
          filters={filterOptions}
          activeFilter={filter}
          onChange={handleFilterChange}
        />
      </div>

      {/* Loading skeleton — matches card height/shape */}
      {isLoading && (
        <div aria-label="Loading todos" role="status" className="space-y-sm">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-border-default rounded-card h-14"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          className="text-danger bg-red-50 border border-red-200 rounded-card p-md text-sm"
          role="alert"
        >
          Failed to load todos:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          message={
            filter === "ALL"
              ? "No todos yet. Add one above!"
              : `No ${filter.toLowerCase()} todos.`
          }
          description={
            filter === "ALL" ? "Your task list is clear." : undefined
          }
        />
      )}

      {/* Todo items list */}
      {!isLoading && !isError && filtered.length > 0 && (
        <ul className="space-y-sm" aria-label="Todo list">
          {filtered.map((todo) => (
            <li key={todo.id}>
              <TodoItem todo={todo} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
