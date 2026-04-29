import { NextResponse } from "next/server";
import DB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";

export async function GET(req) {
  try {
    await DB();

    const statusCounts = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const priorityCounts = await Lead.aggregate([
      { $group: { _id: "$score", count: { $sum: 1 } } },
    ]);

    const agentPerformance = await User.aggregate([
      { $match: { role: "Agent" } },
      {
        $lookup: {
          from: "leads",
          localField: "_id",
          foreignField: "assignedTo",
          as: "assignedLeads",
        },
      },
      {
        $project: {
          name: 1,
          totalLeads: { $size: "$assignedLeads" },
          closedLeads: {
            $size: {
              $filter: {
                input: "$assignedLeads",
                as: "lead",
                cond: { $eq: ["$$lead.status", "Closed"] },
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      statusDistribution: statusCounts,
      priorityDistribution: priorityCounts,
      agentPerformance,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
