import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTodos } from "@/hooks/useTodos";
import * as apiClient from "@paraymd/api-client";
import type { Todo } from "@paraymd/types";

jest.mock("@paraymd/api-client");

const TODOS: Todo[] = [
  { id: "1", title: "Test todo", status: "TODO", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useTodos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns todos on successful fetch", async () => {
    (apiClient.getTodos as jest.Mock).mockResolvedValue({ data: TODOS, error: null });
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(TODOS);
  });

  it("throws when the API returns an error string", async () => {
    (apiClient.getTodos as jest.Mock).mockResolvedValue({ data: null, error: "Failed to fetch todos" });
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe("Failed to fetch todos");
  });
});
