/**
 * @jest-environment node
 *
 * Unit tests for PATCH /api/todos/:id and DELETE /api/todos/:id
 * Covers issues: #16 (PATCH todo), #17 (DELETE todo),
 *                #37 (consistent response shape), #38 (Zod validation errors)
 */

import { NextRequest } from "next/server";
import { PATCH, DELETE } from "@/app/api/todos/[id]/route";
import { prisma } from "@paraymd/db";

jest.mock("@paraymd/db", () => ({
  prisma: {
    todo: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockUpdate = prisma.todo.update as jest.Mock;
const mockDelete = prisma.todo.delete as jest.Mock;

type RouteContext = { params: { id: string } };

function makePatchRequest(id: string, body: unknown): [NextRequest, RouteContext] {
  const req = new NextRequest(`http://localhost/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return [req, { params: { id } }];
}

function makeDeleteRequest(id: string): [NextRequest, RouteContext] {
  const req = new NextRequest(`http://localhost/api/todos/${id}`, {
    method: "DELETE",
  });
  return [req, { params: { id } }];
}

function makePrismaNotFoundError(): Error & { code: string } {
  const err = new Error("Record not found") as Error & { code: string };
  err.code = "P2025";
  return err;
}

const SAMPLE_TODO = {
  id: "abc-1",
  title: "Buy milk",
  status: "TODO",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PATCH /api/todos/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates status to COMPLETE and returns 200 with { data: todo, error: null } (#16, #37)", async () => {
    const updated = { ...SAMPLE_TODO, status: "COMPLETE" };
    mockUpdate.mockResolvedValue(updated);

    const [req, ctx] = makePatchRequest("abc-1", { status: "COMPLETE" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: updated, error: null });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "abc-1" },
      data: { status: "COMPLETE" },
    });
  });

  it("returns 400 with validation error for invalid status value (#38)", async () => {
    const [req, ctx] = makePatchRequest("abc-1", { status: "INVALID_STATUS" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.data).toBeNull();
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when title is an empty string (#38)", async () => {
    const [req, ctx] = makePatchRequest("abc-1", { title: "" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.data).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 with { data: null, error: 'Todo not found' } when prisma throws P2025 (#37)", async () => {
    mockUpdate.mockRejectedValue(makePrismaNotFoundError());

    const [req, ctx] = makePatchRequest("nonexistent-id", { status: "COMPLETE" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ data: null, error: "Todo not found" });
  });

  it("returns 500 on unexpected prisma error", async () => {
    mockUpdate.mockRejectedValue(new Error("DB connection lost"));

    const [req, ctx] = makePatchRequest("abc-1", { status: "COMPLETE" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ data: null, error: "Failed to update todo" });
  });
});

describe("DELETE /api/todos/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes a todo and returns 200 with { data: todo, error: null } (#17, #37)", async () => {
    mockDelete.mockResolvedValue(SAMPLE_TODO);

    const [req, ctx] = makeDeleteRequest("abc-1");
    const res = await DELETE(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: SAMPLE_TODO, error: null });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "abc-1" } });
  });

  it("returns 404 with { data: null, error: 'Todo not found' } for nonexistent id (#37)", async () => {
    mockDelete.mockRejectedValue(makePrismaNotFoundError());

    const [req, ctx] = makeDeleteRequest("nonexistent-id");
    const res = await DELETE(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ data: null, error: "Todo not found" });
  });

  it("returns 500 on unexpected prisma error", async () => {
    mockDelete.mockRejectedValue(new Error("Unexpected DB failure"));

    const [req, ctx] = makeDeleteRequest("abc-1");
    const res = await DELETE(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ data: null, error: "Failed to delete todo" });
  });
});
