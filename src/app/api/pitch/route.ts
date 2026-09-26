import { NextRequest, NextResponse } from "next/server";
import { evaluatePitch } from "@/engine/pitch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, problem, solution, ask, valuation, use_of_funds, target_archetype } = body;

    if (!company || !ask || !valuation || !target_archetype) {
      return NextResponse.json(
        { success: false, error: "Missing required pitch parameters" },
        { status: 400 }
      );
    }

    const outcome = evaluatePitch({
      company,
      problem: problem || "",
      solution: solution || "",
      ask: Number(ask),
      valuation: Number(valuation),
      use_of_funds: use_of_funds || {
        product: ask * 0.4,
        marketing: ask * 0.3,
        hiring: ask * 0.15,
        sales: ask * 0.1,
        reserve: ask * 0.05,
      },
      target_archetype,
    });

    return NextResponse.json({
      success: true,
      outcome,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to evaluate pitch" },
      { status: 500 }
    );
  }
}
