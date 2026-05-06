import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useCreateTodo } from "@/hooks/useCreateTodo";
import * as apiClient from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";

jest.mock("@paraymd/api-client");

const EXISTING: Todo[] = [
  {
    id: "1",
    title: "Existing todo",
    status: "TODO",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const SERVER_TODO: Todo = {
  id: "server-99",
  title: "New todo",
  status: "TODO",
  createdAt: "2024-01-02T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
};

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

describe("useCreateTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("optimistically adds item to cache before server responds", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], EXISTING);

    // Delay resolution so we can inspect in-flight state
    let resolve!: (v: { data: Todo; error: null }) => void;
    const pending = new Promise<{ data: Todo; error: null }>((res) => {
      resolve = res;
    });
    (apiClient.createTodo as jest.Mock).mockReturnValue(pending);

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: makeWrapper(qc),
    });

    act(() => {
      result.current.mutate("New todo");
    });

    // onMutate fires synchronously inside the act — cache should already contain the optimistic item
    await waitFor(() => {
      const cache = qc.getQueryData<Todo[]>(["todos"]);
      expect(cache).toHaveLength(2);
      expect(cache![0].title).toBe("New todo");
      expect(cache![0].id).toMatch(/^temp-/);
    });

    // Now let the server resolve
    act(() => {
      resolve({ data: SERVER_TODO, error: null });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ data: SERVER_TODO, error: null });
  });

  it("replaces optimistic item with server response after success", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], EXISTING);

    (apiClient.createTodo as jest.Mock).mockResolvedValue({
      data: SERVER_TODO,
      error: null,
    });
    // Suppress the onSettled invalidation refetch to keep cache predictable
    jest.spyOn(qc, "invalidateQueries").mockResolvedValue();

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("New todo");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ data: SERVER_TODO, error: null });
  });

  it("rolls back cache to previous state on error", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], EXISTING);

    (apiClient.createTodo as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("New todo");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cache = qc.getQueryData<Todo[]>(["todos"]);
    expect(cache).toEqual(EXISTING);
  });

  it("calls invalidateQueries on settled (success)", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], EXISTING);

    (apiClient.createTodo as jest.Mock).mockResolvedValue({
      data: SERVER_TODO,
      error: null,
    });
    const invalidateSpy = jest
      .spyOn(qc, "invalidateQueries")
      .mockResolvedValue();

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("New todo");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["todos"],
    });
  });

  it("calls invalidateQueries on settled (error)", async () => {
    const qc = makeQueryClient();
    qc.setQueryData(["todos"], EXISTING);

    (apiClient.createTodo as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );
    const invalidateSpy = jest
      .spyOn(qc, "invalidateQueries")
      .mockResolvedValue();

    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: makeWrapper(qc),
    });

    await act(async () => {
      result.current.mutate("New todo");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["todos"],
    });
  });
});
