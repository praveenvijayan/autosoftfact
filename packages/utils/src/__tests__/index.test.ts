import { cn, formatDate } from "../index";

describe("cn", () => {
  it("joins two class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out false", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  it("filters out undefined", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("filters out null", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(false, undefined, null)).toBe("");
  });

  it("returns single class when only one truthy value", () => {
    expect(cn("only")).toBe("only");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    // Use UTC noon to avoid timezone edge-cases in CI
    const result = formatDate("2024-01-15T12:00:00.000Z");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });

  it("formats a Date object", () => {
    const date = new Date("2024-06-20T12:00:00.000Z");
    const result = formatDate(date);
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2024/);
  });

  it("returns a non-empty string", () => {
    expect(formatDate(new Date())).toBeTruthy();
  });
});
