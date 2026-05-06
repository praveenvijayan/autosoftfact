import { TodoInput } from "@/components/TodoInput";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-xl py-3xl">
        {/* Page header — Heading LG / typography scale */}
        <header className="mb-2xl">
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            My Todos
          </h1>
          <p className="text-base text-text-secondary mt-xs">
            Stay on top of your tasks.
          </p>
        </header>

        {/* Quick-capture input */}
        <TodoInput />

        {/* Todo list with filter tabs */}
        <TodoList />
      </div>
    </main>
  );
}
