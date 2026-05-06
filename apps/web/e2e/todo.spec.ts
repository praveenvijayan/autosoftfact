import { test, expect } from "@playwright/test";

test.describe("Todo App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads and shows heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "My Todos" })).toBeVisible();
  });

  test("can add a todo by pressing Enter", async ({ page }) => {
    const input = page.getByLabel("New todo title");
    await input.fill("My new task");
    await input.press("Enter");
    await expect(page.getByText("My new task")).toBeVisible();
  });

  test("can add a todo by clicking Add button", async ({ page }) => {
    const input = page.getByLabel("New todo title");
    await input.fill("Button task");
    await page.getByLabel("Add todo").click();
    await expect(page.getByText("Button task")).toBeVisible();
  });

  test("shows error when submitting empty input", async ({ page }) => {
    await page.getByLabel("Add todo").click();
    await expect(page.getByRole("alert")).toContainText("empty");
  });

  test("can toggle todo status", async ({ page }) => {
    // Add a todo first
    const input = page.getByLabel("New todo title");
    await input.fill("Toggle me");
    await input.press("Enter");
    await expect(page.getByText("Toggle me")).toBeVisible();

    // Toggle it
    const checkbox = page.getByLabel(/Mark "Toggle me"/);
    await checkbox.check();
    await expect(page.getByText("Toggle me")).toHaveClass(/line-through/);
  });

  test("can delete a todo", async ({ page }) => {
    const input = page.getByLabel("New todo title");
    await input.fill("Delete me");
    await input.press("Enter");
    await expect(page.getByText("Delete me")).toBeVisible();

    // Hover over the item to reveal delete button
    const item = page.locator(".group").filter({ hasText: "Delete me" });
    await item.hover();
    await item.getByLabel(/Delete "Delete me"/).click();
    await expect(page.getByText("Delete me")).not.toBeVisible();
  });

  test("filter buttons work", async ({ page }) => {
    // Add a todo and complete it
    const input = page.getByLabel("New todo title");
    await input.fill("Complete task");
    await input.press("Enter");
    await page.getByLabel(/Mark "Complete task"/).check();

    await input.fill("Pending task");
    await input.press("Enter");

    // Filter to TODO only
    await page.getByRole("button", { name: "Todo" }).click();
    await expect(page.getByText("Pending task")).toBeVisible();
    await expect(page.getByText("Complete task")).not.toBeVisible();

    // Filter to COMPLETE only
    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText("Complete task")).toBeVisible();
    await expect(page.getByText("Pending task")).not.toBeVisible();

    // Back to All
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText("Pending task")).toBeVisible();
    await expect(page.getByText("Complete task")).toBeVisible();
  });
});
