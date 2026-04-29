import { NextResponse } from "next/server";
import DB from "@/lib/db";
import Lead from "@/models/Lead";

export async function DELETE(req) {
  try {
    await DB();
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("id");
    const role = req.headers.get("x-user-role")?.toLowerCase();

    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    await Lead.findByIdAndDelete(leadId);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
