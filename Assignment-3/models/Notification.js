import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipientEmail: { type: String },
  recipientPhone: { type: String },
  type: { type: String, enum: ["Email", "WhatsApp"], required: true },
  subject: { type: String },
  content: { type: String },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Sent", "Failed"], default: "Sent" },
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
