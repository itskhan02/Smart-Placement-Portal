const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: ["spam", "abuse", "fake_job", "harassment", "other"],
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      enum: ["profile", "chat"],
      default: "profile",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "action_taken"],
      default: "pending",
    },
  },
  { timestamps: true },
);

reportSchema.index({ reportedUser: 1, reportedBy: 1 }, { unique: true });

module.exports =
  mongoose.models.Report || mongoose.model("Report", reportSchema);
