import { NextResponse } from "next/server";
import { GAME_CONFIG } from "@/engine/config";

export async function GET() {
  return NextResponse.json({
    success: true,
    config: GAME_CONFIG,
  });
}
