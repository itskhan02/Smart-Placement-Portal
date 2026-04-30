const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    location: { type: String, required: true },
    experience: { type: String },
    salary: { type: String, required: true },
    description: { type: String, required: true },
    skillsrequired: [{ type: String, required: true }],
    postedDate: { type: Date, default: Date.now },
    jobType: {
      type: String,
      enum: ["full-time", "remote", "internship"],
      default: "full-time",
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    application: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);
