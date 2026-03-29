import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { toggleReviewStatusForUser } from "@/lib/server/review-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await toggleReviewStatusForUser(session.user.id, id);

  if (!result.success) {
    const status = result.error === "Review not found" ? 404 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
