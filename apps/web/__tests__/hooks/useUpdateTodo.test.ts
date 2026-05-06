import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useUpdateTodo } from "@/hooks/useUpdateTodo";
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
    status: "TODO",
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

describe("useUpdateTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("optimistically updates item fields in cache before server responds", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    let resolve!: (v: { data: Todo; error: null }) => void;
    const pending = new Promise<{ data: Todo; error: null }>((res) => {
      resolve = res;
    });
    (apiClient.updateTodo as jest.Mock).mockReturnValue(pending);

    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: makeWrapper(qc),
    });

    act(() => {
      result.current.mutate({ id: "1", data: { status: "COMPLETE" } });
    });

    await waitFor(() => {
      const cache = qc.getQueryData<Todo[]>(["todos"]);
      const updated = cache?.find((t) => t.id === "1");
      expect(updated?.status).toBe("COMPLETE");
    });

    // Second item is unchanged
    const cache = qc.getQueryData<Todo[]>(["todos"]);
    expect(cache?.find((t) => t.id === "2")?.status).toBe("TODO");

    act(() => {
      resolve({ data: { ...TODOS[0], status: "COMPLETE" }, error: null });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("optimistically updates title field in cache", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    let resolve!: (v: { data: Todo; error: null }) => void;
    const pending = new Promise<{ data: Todo; error: null }>((res) => {
      resolve = res;
    });
    (apiClient.updateTodo as jest.Mock).mockReturnValue(pending);

    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: makeWrapper(qc),
    });

    act(() => {
      result.current.mutate({ id: "2", data: { title: "Updated title" } });
    });

    await waitFor(() => {
      const cache = qc.getQueryData<Todo[]>(["todos"]);
      expect(cache?.find((t) => t.id === "2")?.title).toBe("Updated title");
    });

    act(() => {
      resolve({ data: { ...TODOS[1], title: "Updated title" }, error: null });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("rolls back cache when server returns an error", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    (apiClient.updateTodo as jest.Mock).mockRejectedValue(
      new Error("Update failed")
    );

    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate({ id: "1", data: { status: "COMPLETE" } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cache = qc.getQueryData<Todo[]>(["todos"]);
    expect(cache).toEqual(TODOS);
  });

  it("calls invalidateQueries on settled (success)", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    const serverTodo: Todo = { ...TODOS[0], status: "COMPLETE" };
    (apiClient.updateTodo as jest.Mock).mockResolvedValue({
      data: serverTodo,
      error: null,
    });
    const invalidateSpy = jest
      .spyOn(qc, "invalidateQueries")
      .mockResolvedValue();

    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate({ id: "1", data: { status: "COMPLETE" } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["todos"] });
  });

  it("calls invalidateQueries on settled (error)", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], TODOS);

    (apiClient.updateTodo as jest.Mock).mockRejectedValue(
      new Error("Update failed")
    );
    const invalidateSpy = jest
      .spyOn(qc, "invalidateQueries")
      .mockResolvedValue();

    const { result } = renderHook(() => useUpdateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate({ id: "1", data: { status: "COMPLETE" } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["todos"] });
  });
});
