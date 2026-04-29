import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    propertyInterest: { type: String, default: "Residential" },
    budget: { type: Number, required: true },
    status: { type: String, default: "New" },
    notes: { type: String, default: "" },
    score: { type: String, enum: ["High", "Medium", "Low"] },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

// Backend Scoring Logic — auto-runs on save
LeadSchema.pre("save", function () {
  if (this.budget > 20000000) {
    this.score = "High";
  } else if (this.budget >= 10000000) {
    this.score = "Medium";
  } else {
    this.score = "Low";
  }
});

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
