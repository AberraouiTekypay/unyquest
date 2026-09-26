import { NextRequest, NextResponse } from "next/server";
import { executeFundingRound } from "@/engine/investment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, investor_id, investor_name, amount, pre_money_valuation, existing_cap_table } = body;

    if (!company || !investor_id || !amount || !pre_money_valuation) {
      return NextResponse.json(
        { success: false, error: "Missing required investment parameters" },
        { status: 400 }
      );
    }

    const result = executeFundingRound({
      company,
      investor_id,
      investor_name: investor_name || "Angel Investor",
      amount: Number(amount),
      pre_money_valuation: Number(pre_money_valuation),
      existing_cap_table: existing_cap_table || [],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute investment" },
      { status: 500 }
    );
  }
}
