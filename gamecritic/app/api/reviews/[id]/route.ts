import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deleteReviewForUser, updateReviewForUser } from "@/lib/server/review-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const result = await updateReviewForUser(session.user.id, id, body);

  if (!result.success) {
    const status =
      result.error === "Review not found" ? 404 : result.error === "Validation failed" ? 400 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteReviewForUser(session.user.id, id);

  if (!result.success) {
    const status = result.error === "Review not found" ? 404 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
