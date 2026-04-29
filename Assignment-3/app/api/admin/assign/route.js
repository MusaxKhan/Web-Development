import { NextResponse } from "next/server";
import DB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { sendLeadEmail } from "@/lib/mail";

export async function PATCH(req) {
  try {
    await DB();
    const { leadId, agentId } = await req.json();
    const role = req.headers.get("x-user-role")?.toLowerCase();
    const adminId = req.headers.get("x-user-id");

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!leadId || !agentId) {
      return NextResponse.json({ error: "leadId and agentId are required" }, { status: 400 });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: agentId },
      { new: true }
    );

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await ActivityLog.create({
      leadId,
      action: "Assignment",
      performedBy: adminId,
      details: "Lead assigned/reassigned to a new agent by Admin.",
      timestamp: new Date(),
    });

    try {
      const agent = await User.findById(agentId);
      if (agent?.email) {
        await sendLeadEmail(agent.email, "Lead Assigned to You", {
          name: updatedLead.name,
          status: updatedLead.status || "New",
          score: updatedLead.score || "N/A",
        });
      }
    } catch (mailError) {
      console.error("Non-critical Email Error:", mailError.message);
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
