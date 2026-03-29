import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getMyReviewsPaginated } from "@/lib/db/reviews";
import { createReviewForUser } from "@/lib/server/review-service";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const data = await getMyReviewsPaginated(session.user.id, page);

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = await createReviewForUser(session.user.id, body);

  if (!result.success) {
    const status = result.error === "Validation failed" ? 400 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
