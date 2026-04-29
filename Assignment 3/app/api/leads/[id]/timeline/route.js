import { NextResponse } from "next/server";
import DB from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req, { params }) {
  try {
    await DB();
    const { id } = await params;
    const logs = await ActivityLog.find({ leadId: id })
      .populate("performedBy", "name")
      .sort("timestamp")
      .lean();
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
