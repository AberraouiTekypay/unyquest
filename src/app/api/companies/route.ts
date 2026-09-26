import { NextRequest, NextResponse } from "next/server";
import { createCompany } from "@/engine/company";
import { SEED_STARTUP_ARCHETYPES } from "@/engine/archetypes";

export async function GET() {
  return NextResponse.json({
    success: true,
    archetypes: SEED_STARTUP_ARCHETYPES,
    count: SEED_STARTUP_ARCHETYPES.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { founder_id, founder_name, name, tagline, sector, market, business_model, founder_strengths } = body;

    if (!name || !sector || !market || !business_model) {
      return NextResponse.json(
        { success: false, error: "Missing required company attributes" },
        { status: 400 }
      );
    }

    const newCompany = createCompany({
      founder_id: founder_id || "founder-anon",
      founder_name: founder_name || "Anonymous Founder",
      name,
      tagline: tagline || "",
      sector,
      market,
      business_model,
      founder_strengths: founder_strengths || [],
    });

    return NextResponse.json({
      success: true,
      company: newCompany,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create company" },
      { status: 500 }
    );
  }
}
