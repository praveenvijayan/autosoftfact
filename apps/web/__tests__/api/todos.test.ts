/**
 * @jest-environment node
 *
 * Unit tests for GET /api/todos and POST /api/todos
 * Covers issues: #15 (GET todos), #33 (ordering latest-first),
 *                #37 (consistent response shape), #38 (Zod validation errors)
 */

import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/todos/route";
import { prisma } from "@paraymd/db";

jest.mock("@paraymd/db", () => ({
  prisma: {
    todo: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockFindMany = prisma.todo.findMany as jest.Mock;
const mockCreate = prisma.todo.create as jest.Mock;

const SAMPLE_TODOS = [
  {
    id: "abc-1",
    title: "Second todo",
    status: "TODO",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "abc-2",
    title: "First todo",
    status: "COMPLETE",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/todos", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/todos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns { data: todos, error: null } with HTTP 200 on success (#15, #37)", async () => {
    mockFindMany.mockResolvedValue(SAMPLE_TODOS);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: SAMPLE_TODOS, error: null });
  });

  it("calls prisma with orderBy createdAt desc — latest-first (#33)", async () => {
    mockFindMany.mockResolvedValue(SAMPLE_TODOS);

    await GET();

    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns { data: null, error: 'Failed to fetch todos' } with HTTP 500 when prisma throws", async () => {
    mockFindMany.mockRejectedValue(new Error("DB connection failed"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ data: null, error: "Failed to fetch todos" });
  });
});

describe("POST /api/todos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a todo and returns 201 with { data: todo, error: null } (#37)", async () => {
    const created = {
      id: "new-1",
      title: "Buy milk",
      status: "TODO",
      createdAt: "2024-03-01T00:00:00.000Z",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    mockCreate.mockResolvedValue(created);

    const req = makePostRequest({ title: "Buy milk" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual({ data: created, error: null });
    expect(mockCreate).toHaveBeenCalledWith({ data: { title: "Buy milk" } });
  });

  it("returns 400 with validation error when title is empty string (#38)", async () => {
    const req = makePostRequest({ title: "" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.data).toBeNull();
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 with validation error when title field is missing (#38)", async () => {
    const req = makePostRequest({});
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.data).toBeNull();
    expect(typeof body.error).toBe("string");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("passes trimmed title to prisma when title has surrounding whitespace (#38)", async () => {
    // Zod's .trim() transform strips leading/trailing whitespace before the data
    // reaches prisma.create — verify the stored title is trimmed.
    const created = {
      id: "new-2",
      title: "Buy milk",
      status: "TODO",
      createdAt: "2024-03-01T00:00:00.000Z",
      updatedAt: "2024-03-01T00:00:00.000Z",
    };
    mockCreate.mockResolvedValue(created);

    const req = makePostRequest({ title: "  Buy milk  " });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith({ data: { title: "Buy milk" } });
  });

  it("returns 500 when prisma.create throws unexpectedly", async () => {
    mockCreate.mockRejectedValue(new Error("Unexpected DB error"));

    const req = makePostRequest({ title: "Valid title" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ data: null, error: "Failed to create todo" });
  });
});
