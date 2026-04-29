import mongoose from "mongoose";

const FollowUpSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  followUpDate: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Overdue"], default: "Pending" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.FollowUp ||
  mongoose.model("FollowUp", FollowUpSchema);
