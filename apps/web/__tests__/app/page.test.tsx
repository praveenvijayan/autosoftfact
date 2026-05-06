import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("@/components/TodoInput", () => ({
  TodoInput: () => <div data-testid="todo-input-stub" />,
}));

jest.mock("@/components/TodoList", () => ({
  TodoList: () => <div data-testid="todo-list-stub" />,
}));

describe("Home page (#24 #39)", () => {
  it("renders the TodoInput component", () => {
    render(<Home />);
    expect(screen.getByTestId("todo-input-stub")).toBeInTheDocument();
  });

  it("renders the TodoList component", () => {
    render(<Home />);
    expect(screen.getByTestId("todo-list-stub")).toBeInTheDocument();
  });

  it("renders the app heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /my todos/i })).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(<Home />);
    expect(screen.getByText(/stay on top of your tasks/i)).toBeInTheDocument();
  });
});
