import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/Sidebar";

// Mock next/link for test environment
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("Sidebar", () => {
  it("renders the app name", () => {
    render(<Sidebar />);
    expect(screen.getByText("ParayMD")).toBeInTheDocument();
  });

  it("renders a navigation link to home", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /my todos/i })).toHaveAttribute("href", "/");
  });

  it("marks the active nav item with aria-current", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /my todos/i })).toHaveAttribute("aria-current", "page");
  });
});
