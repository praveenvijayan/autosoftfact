import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoInput } from "@/components/TodoInput";
import { useCreateTodo } from "@/hooks/useCreateTodo";

jest.mock("@/hooks/useCreateTodo");

const mockMutate = jest.fn();

function setupMock(isPending = false) {
  (useCreateTodo as jest.Mock).mockReturnValue({
    mutate: mockMutate,
    isPending,
  });
}

describe("TodoInput", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    setupMock();
  });

  it("renders the input and add button", () => {
    render(<TodoInput />);
    expect(screen.getByRole("textbox", { name: /add a new todo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add todo/i })).toBeInTheDocument();
  });

  it("auto-focuses the input on mount (#36)", () => {
    render(<TodoInput />);
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("calls createTodo when Enter is pressed with a non-empty title (#28)", async () => {
    const user = userEvent.setup();
    render(<TodoInput />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Buy milk{Enter}");
    expect(mockMutate).toHaveBeenCalledWith("Buy milk", expect.any(Object));
  });

  it("calls createTodo when Add button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoInput />);
    await user.type(screen.getByRole("textbox"), "Walk the dog");
    await user.click(screen.getByRole("button", { name: /add todo/i }));
    expect(mockMutate).toHaveBeenCalledWith("Walk the dog", expect.any(Object));
  });

  it("shows validation error for empty title (#32)", async () => {
    const user = userEvent.setup();
    render(<TodoInput />);
    await user.type(screen.getByRole("textbox"), "{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot be empty/i);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows validation error for whitespace-only title (#32)", async () => {
    const user = userEvent.setup();
    render(<TodoInput />);
    await user.type(screen.getByRole("textbox"), "   {Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot be empty/i);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("clears the input when Escape is pressed (#36)", async () => {
    const user = userEvent.setup();
    render(<TodoInput />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Some text");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("clears validation error when user starts typing", async () => {
    const user = userEvent.setup();
    render(<TodoInput />);
    await user.type(screen.getByRole("textbox"), "{Enter}");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox"), "a");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables input and button while pending", () => {
    setupMock(true);
    render(<TodoInput />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /add todo/i })).toBeDisabled();
  });

  it("shows Adding… text while pending", () => {
    setupMock(true);
    render(<TodoInput />);
    expect(screen.getByRole("button")).toHaveTextContent(/Adding…/);
  });
});
