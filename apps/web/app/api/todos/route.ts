import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@paraymd/db";
import type { ApiResponse } from "@paraymd/types";

const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
});

// GET /api/todos — returns all todos ordered latest first (#15, #33)
export async function GET(): Promise<NextResponse<ApiResponse<unknown[]>>> {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: todos, error: null });
  } catch (err) {
    console.error("[GET /api/todos]", err);
    return NextResponse.json(
      { data: null, error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST /api/todos — creates a new todo (#14, #32)
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await req.json();
    const parsed = CreateTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: { title: parsed.data.title },
    });

    return NextResponse.json({ data: todo, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/todos]", err);
    return NextResponse.json(
      { data: null, error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
