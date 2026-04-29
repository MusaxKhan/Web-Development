import { NextResponse } from "next/server";
import DB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { sendLeadEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    await DB();
    const body = await req.json();
    const agentId = req.headers.get("x-user-id");

    if (!agentId) {
      return NextResponse.json({ error: "Unauthorized: x-user-id missing" }, { status: 401 });
    }

    if (!body.name || !body.email || !body.budget) {
      return NextResponse.json({ error: "name, email and budget are required" }, { status: 400 });
    }

    const newLead = await Lead.create({ ...body, assignedTo: agentId });

    await ActivityLog.create({
      leadId: newLead._id,
      action: "Lead Created",
      performedBy: agentId,
      details: `New lead created with budget PKR ${newLead.budget.toLocaleString()} and priority ${newLead.score}.`,
      timestamp: new Date(),
    });

    try {
      const agent = await User.findById(agentId);
      if (agent?.email) {
        await sendLeadEmail(agent.email, "New Lead Created", {
          name: newLead.name,
          status: newLead.status || "New",
          score: newLead.score || "N/A",
        });
      }
    } catch (mailError) {
      console.error("Non-critical Email Error:", mailError.message);
    }

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await DB();
    const role = req.headers.get("x-user-role");
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "User context missing" }, { status: 400 });
    }

    let leads;
    if (role === "admin") {
      leads = await Lead.find().populate("assignedTo", "name").sort("-createdAt").lean();
    } else {
      leads = await Lead.find({ assignedTo: userId }).sort("-createdAt").lean();
    }

    return NextResponse.json(leads);
  } catch (error) {
    console.error("GET /api/leads Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
