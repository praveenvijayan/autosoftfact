"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
import { useCreateTodo } from "@/hooks/useCreateTodo";

export const TodoInput = memo(function TodoInput() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTodo, isPending } = useCreateTodo();

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Title cannot be empty");
      return;
    }
    setError("");
    createTodo(trimmed, {
      onSuccess: () => {
        setValue("");
        // Return focus to input after successful submission
        inputRef.current?.focus();
      },
    });
  }, [value, createTodo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
      // Escape clears input
      if (e.key === "Escape") {
        setValue("");
        setError("");
      }
    },
    [handleSubmit]
  );

  return (
    <div className="mb-lg">
      <div className="flex gap-sm">
        {/* Large quick-capture input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done? (Enter to save, Esc to clear)"
          disabled={isPending}
          aria-label="Add a new todo"
          className={[
            "flex-1",
            "bg-bg-surface border border-border-default",
            "rounded-card px-xl py-lg",
            "text-lg text-text-primary placeholder:text-text-secondary",
            "shadow-card",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-shadow duration-150",
          ].join(" ")}
        />
        <button
          onClick={handleSubmit}
          disabled={isPending}
          aria-label="Add todo"
          className={[
            "bg-accent-primary text-white",
            "px-xl py-lg rounded-card",
            "text-base font-medium",
            "hover:bg-blue-700 active:bg-blue-800",
            "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            "whitespace-nowrap",
          ].join(" ")}
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && (
        <p className="text-danger text-sm mt-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
