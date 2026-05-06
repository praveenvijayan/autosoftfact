import { TodoInput } from "@/components/TodoInput";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <div className="px-xl py-3xl max-w-2xl">
      {/* Page header — Heading LG style from typography scale */}
      <header className="mb-2xl">
        <h1 className="text-3xl font-bold text-text-primary leading-tight">
          My Todos
        </h1>
        <p className="text-base text-text-secondary mt-xs">
          Stay on top of your tasks.
        </p>
      </header>

      {/* Large quick-capture input */}
      <TodoInput />

      {/* Filtered todo list */}
      <TodoList />
    </div>
  );
}
