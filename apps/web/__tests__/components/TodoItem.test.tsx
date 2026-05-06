import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "@/components/TodoItem";
import { useUpdateTodo } from "@/hooks/useUpdateTodo";
import { useDeleteTodo } from "@/hooks/useDeleteTodo";
import type { Todo } from "@paraymd/types";

jest.mock("@/hooks/useUpdateTodo");
jest.mock("@/hooks/useDeleteTodo");

const mockUpdate = jest.fn();
const mockDelete = jest.fn();

function setupMocks(isPending = false) {
  (useUpdateTodo as jest.Mock).mockReturnValue({ mutate: mockUpdate, isPending });
  (useDeleteTodo as jest.Mock).mockReturnValue({ mutate: mockDelete, isPending });
}

const TODO_ITEM: Todo = {
  id: "abc-1",
  title: "Buy groceries",
  status: "TODO",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const COMPLETE_ITEM: Todo = { ...TODO_ITEM, status: "COMPLETE" };

describe("TodoItem", () => {
  beforeEach(() => {
    mockUpdate.mockClear();
    mockDelete.mockClear();
    setupMocks();
  });

  it("renders the todo title", () => {
    render(<TodoItem todo={TODO_ITEM} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders unchecked checkbox for TODO status (#29)", () => {
    render(<TodoItem todo={TODO_ITEM} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders checked checkbox for COMPLETE status (#29)", () => {
    render(<TodoItem todo={COMPLETE_ITEM} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("applies line-through style when COMPLETE (#29)", () => {
    render(<TodoItem todo={COMPLETE_ITEM} />);
    expect(screen.getByText("Buy groceries")).toHaveClass("line-through");
  });

  it("calls updateTodo with COMPLETE when toggling TODO item (#29)", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={TODO_ITEM} />);
    await user.click(screen.getByRole("checkbox"));
    expect(mockUpdate).toHaveBeenCalledWith({
      id: "abc-1",
      data: { status: "COMPLETE" },
    });
  });

  it("calls updateTodo with TODO when toggling COMPLETE item (#29)", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={COMPLETE_ITEM} />);
    await user.click(screen.getByRole("checkbox"));
    expect(mockUpdate).toHaveBeenCalledWith({
      id: "abc-1",
      data: { status: "TODO" },
    });
  });

  it("calls deleteTodo with the item id when delete button is clicked (#30)", async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={TODO_ITEM} />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(mockDelete).toHaveBeenCalledWith("abc-1");
  });

  it("disables controls while update is pending", () => {
    setupMocks(true);
    render(<TodoItem todo={TODO_ITEM} />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });
});
