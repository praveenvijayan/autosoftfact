import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useDeleteTodo } from "@/hooks/useDeleteTodo";
import * as apiClient from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";

jest.mock("@paraymd/api-client");

const TODOS: Todo[] = [
  {
    id: "1",
    title: "First todo",
    status: "TODO",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Second todo",
    status: "COMPLETE",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("useDeleteTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("optimistically removes item from cache before server responds", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    let resolve!: (v: { data: Todo; error: null }) => void;
    const pending = new Promise<{ data: Todo; error: null }>((res) => {
      resolve = res;
    });
    (apiClient.deleteTodo as jest.Mock).mockReturnValue(pending);

    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: makeWrapper(qc),
    });

    act(() => {
      result.current.mutate("1");
    });

    await waitFor(() => {
      const cache = qc.getQueryData<Todo[]>(["todos"]);
      expect(cache).toHaveLength(1);
      expect(cache![0].id).toBe("2");
    });

    act(() => {
      resolve({ data: TODOS[0], error: null });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("rolls back cache when server returns an error", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    (apiClient.deleteTodo as jest.Mock).mockRejectedValue(
      new Error("Delete failed")
    );

    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cache = qc.getQueryData<Todo[]>(["todos"]);
    expect(cache).toEqual(TODOS);
  });

  it("calls invalidateQueries on settled (success)", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    (apiClient.deleteTodo as jest.Mock).mockResolvedValue({
      data: TODOS[0],
      error: null,
    });
    const invalidateSpy = jest
      .spyOn(qc, "invalidateQueries")
      .mockResolvedValue();

    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["todos"] });
  });

  it("calls invalidateQueries on settled (error)", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    (apiClient.deleteTodo as jest.Mock).mockRejectedValue(
      new Error("Delete failed")
    );
    const invalidateSpy = jest
      .spyOn(qc, "invalidateQueries")
      .mockResolvedValue();

    const { result } = renderHook(() => useDeleteTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["todos"] });
  });
});
