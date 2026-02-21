import { NextRequest, NextResponse } from "next/server";
import { getDefaultRateForCategory } from "@/modules/investments/actions";

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("categoryId");
  if (!categoryId) {
    return NextResponse.json({ rate: 0 });
  }
  const rate = await getDefaultRateForCategory(categoryId);
  return NextResponse.json({ rate });
}
