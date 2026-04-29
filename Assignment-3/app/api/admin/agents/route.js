import { NextResponse } from "next/server";
import DB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await DB();
    const agents = await User.find({ role: "Agent" }).select("name _id");
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
