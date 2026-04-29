import { NextResponse } from "next/server";
import DB from "@/lib/db";
import Lead from "@/models/Lead";
import ActivityLog from "@/models/ActivityLog";

export async function PATCH(req, { params }) {
  try {
    await DB();
    const { id } = await params;
    const body = await req.json();
    const userId = req.headers.get("x-user-id");

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const oldLead = await Lead.findById(id);
    if (!oldLead)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const prevStatus = oldLead.status;
    const prevNotes = oldLead.notes;
    const prevAssigned = String(oldLead.assignedTo);
    const prevFollowUp = oldLead.followUpDate;

    Object.assign(oldLead, body);
    const updatedLead = await oldLead.save();

    let actionType = "Detail Update";
    let changeDetails = "Modified lead information.";

    if (body.status && body.status !== prevStatus) {
      actionType = "Status Update";
      changeDetails = `Changed status from ${prevStatus} to ${body.status}`;
    } else if (body.assignedTo && String(body.assignedTo) !== prevAssigned) {
      actionType = "Reassignment";
      changeDetails = "Lead was reassigned to a different agent.";
    } else if (body.notes !== undefined && body.notes !== prevNotes) {
      actionType = "Note Added";
      changeDetails = "Internal notes were updated.";
    } else if (body.followUpDate) {
      actionType = "Follow-up Set";
      changeDetails = `Follow-up scheduled for ${new Date(body.followUpDate).toLocaleDateString()}`;
    }

    await ActivityLog.create({
      leadId: id,
      action: actionType,
      performedBy: userId,
      details: changeDetails,
      timestamp: new Date(),
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    await DB();
    const { id } = await params;
    const lead = await Lead.findById(id).populate("assignedTo", "name").lean();
    if (!lead)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
