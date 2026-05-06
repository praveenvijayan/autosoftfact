import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "@/components/TodoList";
import { useTodos } from "@/hooks/useTodos";
import type { Todo } from "@paraymd/types";

jest.mock("@/hooks/useTodos");
// TodoItem uses its own hooks — mock the whole component to keep this test focused
jest.mock("@/components/TodoItem", () => ({
  TodoItem: ({ todo }: { todo: Todo }) => <div data-testid="todo-item">{todo.title}</div>,
}));

const TODOS: Todo[] = [
  { id: "1", title: "First todo", status: "TODO", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "2", title: "Second todo", status: "COMPLETE", createdAt: "2024-01-02T00:00:00Z", updatedAt: "2024-01-02T00:00:00Z" },
  { id: "3", title: "Third todo", status: "TODO", createdAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-03T00:00:00Z" },
];

function setupTodos(overrides?: Partial<ReturnType<typeof useTodos>>) {
  (useTodos as jest.Mock).mockReturnValue({
    data: TODOS,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  });
}

describe("TodoList", () => {
  beforeEach(() => setupTodos());

  it("renders all todos by default (All filter) (#35)", () => {
    render(<TodoList />);
    expect(screen.getAllByTestId("todo-item")).toHaveLength(3);
  });

  it("renders filter buttons with counts (#35)", () => {
    render(<TodoList />);
    // Buttons now show counts, e.g. "All (3)", "Todo (2)", "Complete (1)"
    expect(screen.getByRole("button", { name: /^all \(\d+\)$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^todo \(\d+\)$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^complete \(\d+\)$/i })).toBeInTheDocument();
  });

  it("shows correct counts on filter buttons (#35)", () => {
    render(<TodoList />);
    expect(screen.getByRole("button", { name: /^all \(3\)$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^todo \(2\)$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^complete \(1\)$/i })).toBeInTheDocument();
  });

  it("filters to only TODO items (#35)", async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await user.click(screen.getByRole("button", { name: /^todo \(\d+\)$/i }));
    const items = screen.getAllByTestId("todo-item");
    expect(items).toHaveLength(2);
    expect(screen.getByText("First todo")).toBeInTheDocument();
    expect(screen.getByText("Third todo")).toBeInTheDocument();
    expect(screen.queryByText("Second todo")).not.toBeInTheDocument();
  });

  it("filters to only COMPLETE items (#35)", async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await user.click(screen.getByRole("button", { name: /^complete \(\d+\)$/i }));
    const items = screen.getAllByTestId("todo-item");
    expect(items).toHaveLength(1);
    expect(screen.getByText("Second todo")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true (#31)", () => {
    setupTodos({ data: undefined, isLoading: true });
    render(<TodoList />);
    expect(screen.getByRole("status", { name: /loading todos/i })).toBeInTheDocument();
  });

  it("shows error alert when isError is true (#31)", () => {
    setupTodos({ data: undefined, isLoading: false, isError: true, error: new Error("Network error") });
    render(<TodoList />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Network error/i);
  });

  it("shows empty state message when no todos exist (#35)", () => {
    setupTodos({ data: [] });
    render(<TodoList />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("shows filtered empty state when filter returns nothing (#35)", async () => {
    const user = userEvent.setup();
    // Only TODO items exist, filter to COMPLETE
    setupTodos({
      data: TODOS.filter((t) => t.status === "TODO"),
    });
    render(<TodoList />);
    await user.click(screen.getByRole("button", { name: /^complete \(\d+\)$/i }));
    expect(screen.getByText(/no complete todos/i)).toBeInTheDocument();
  });

  it("highlights the active filter button (#35)", async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await user.click(screen.getByRole("button", { name: /^todo \(\d+\)$/i }));
    expect(screen.getByRole("button", { name: /^todo \(\d+\)$/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /^all \(\d+\)$/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("filter buttons have keyboard focus styles (#36)", () => {
    render(<TodoList />);
    const allBtn = screen.getByRole("button", { name: /^all \(\d+\)$/i });
    expect(allBtn.className).toContain("focus:ring-2");
    expect(allBtn.className).toContain("focus:ring-accent-primary");
    expect(allBtn.className).toContain("focus:outline-none");
  });
});
