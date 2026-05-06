import { TodoInput } from "@/components/TodoInput";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Todos</h1>
        <p className="text-gray-500 mb-8">Stay on top of your tasks.</p>
        <TodoInput />
        <TodoList />
      </div>
    </main>
  );
}
