import React from "react";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/AppShell";

describe("AppShell", () => {
  it("renders sidebar content", () => {
    render(
      <AppShell sidebar={<div data-testid="sidebar">Sidebar</div>}>
        <div>Main</div>
      </AppShell>
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders children in main content area", () => {
    render(
      <AppShell sidebar={<div>Sidebar</div>}>
        <div data-testid="main-content">Main content</div>
      </AppShell>
    );
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });

  it("sidebar has complementary landmark with accessible label", () => {
    render(
      <AppShell sidebar={<div>Nav</div>}>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByRole("complementary", { name: /app navigation/i })).toBeInTheDocument();
  });
});
