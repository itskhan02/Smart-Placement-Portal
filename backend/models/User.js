const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["recruiter", "student", "admin"],
    default: "student",
  },
  otp: { type: String },
  otpExpires: { type: Date },
  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },
  emailOtpPurpose: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  isActive: {
    type: Boolean,
    default: true,
  },

  warnings: {
    type: Number,
    default: 0,
  },

  isBanned: {
    type: Boolean,
    default: false,
  },

  deactivatedUntil: {
    type: Date,
    default: null,
  },

  tokenVersion: { type: Number, default: 0 },

  profile: {
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    location: { type: String, default: "" },

    skills: [{ type: String }],
    education: [
      {
        degree: String,
        field: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    experience: [
      {
        title: String,
        duration: String,
      },
    ],
    resume: {
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    resumeAnalysisHistory: [
      {
        fileName: String,
        fileUrl: String,
        jobDescription: { type: String, default: "" },
        jobTitle: { type: String, default: "" },
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
          default: null,
        },
        score: { type: Number, default: 0 },
        atsScore: { type: Number, default: 0 },
        analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
        extractedText: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    designation: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    linkedin: { type: String, default: "" },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  settings: {
    security: {
      twoFactor: { type: Boolean, default: false },
      loginAlerts: { type: Boolean, default: true },
    },

    notifications: {
      inApp: {
        applicants: { type: Boolean, default: false },
        messages: { type: Boolean, default: false },
        jobAlerts: { type: Boolean, default: false },
        system: { type: Boolean, default: false },
      },
      email: {
        enabled: { type: Boolean, default: false },
        applications: { type: Boolean, default: false },
        interviews: { type: Boolean, default: false },
      },
    },
  },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);