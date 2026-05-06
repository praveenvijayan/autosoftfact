"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
import { useCreateTodo } from "@/hooks/useCreateTodo";

export const TodoInput = memo(function TodoInput() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTodo, isPending } = useCreateTodo();

  // Auto-focus on mount (#36)
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
      onSuccess: () => setValue(""),
    });
  }, [value, createTodo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
      // Escape clears input (#36)
      if (e.key === "Escape") {
        setValue("");
        setError("");
      }
    },
    [handleSubmit]
  );

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo… (Enter to save)"
          disabled={isPending}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="New todo title"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          aria-label="Add todo"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
