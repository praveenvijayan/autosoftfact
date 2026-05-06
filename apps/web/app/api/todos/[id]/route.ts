import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@paraymd/db";
import type { ApiResponse } from "@paraymd/types";

const UpdateTodoSchema = z.object({
  title: z.string().min(1, "Title is required").trim().optional(),
  status: z.enum(["TODO", "COMPLETE"]).optional(),
});

type RouteContext = { params: { id: string } };

// PATCH /api/todos/:id — updates a todo (#16, #29, #37, #38)
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await req.json();
    const parsed = UpdateTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ data: todo, error: null });
  } catch (err: unknown) {
    const isNotFound =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025";

    if (isNotFound) {
      return NextResponse.json(
        { data: null, error: "Todo not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/:id — deletes a todo (#17, #30)
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const todo = await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: todo, error: null });
  } catch (err: unknown) {
    const isNotFound =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025";

    if (isNotFound) {
      return NextResponse.json(
        { data: null, error: "Todo not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
