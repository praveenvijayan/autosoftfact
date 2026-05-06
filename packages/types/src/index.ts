export type TodoStatus = "TODO" | "COMPLETE";

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
