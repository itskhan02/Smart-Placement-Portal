const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION_SUBMITTED",
        "APPLICATION_STATUS",
        "INTERVIEW",
        "MESSAGE",
        "JOB",
        "SECURITY",
        "SYSTEM",
        "REPORT",
        "ALERT",
        "ADMIN_WARNING",
      ],
    },

    title: String,
    message: String,

    isRead: {
      type: Boolean,
      default: false,
    },

    link: String,

    data: {
      type: Object,
      default: {},
    },

  },
  { timestamps: true },
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);