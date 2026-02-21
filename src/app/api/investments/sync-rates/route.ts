import { NextResponse } from "next/server";
import { syncTesouroDiretoRates } from "@/modules/investments/actions";

/**
 * POST /api/investments/sync-rates
 * Fetches latest Tesouro Direto rates and stores them in the DB.
 * Intended to be called from a CI/deploy hook or scheduled job.
 */
export async function POST() {
  const result = await syncTesouroDiretoRates();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await syncTesouroDiretoRates();
  return NextResponse.json(result);
}
