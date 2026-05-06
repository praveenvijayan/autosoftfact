import type { Todo, ApiResponse } from "@paraymd/types";

const BASE = "/api/todos";

export async function getTodos(): Promise<ApiResponse<Todo[]>> {
  const res = await fetch(BASE);
  return res.json();
}

export async function createTodo(title: string): Promise<ApiResponse<Todo>> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function updateTodo(
  id: string,
  data: Partial<Pick<Todo, "title" | "status">>
): Promise<ApiResponse<Todo>> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTodo(id: string): Promise<ApiResponse<Todo>> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.json();
}
