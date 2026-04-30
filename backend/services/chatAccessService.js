const Application = require("../models/application");
const Job = require("../models/Job");
const User = require("../models/User");

const CHAT_ENABLED_STATUSES = ["reviewing", "accepted", "rejected"];

const canStatusAccessChat = (status) => CHAT_ENABLED_STATUSES.includes(status);

const getAllowedChatContacts = async (user) => {
  if (user.role === "student") {
    const applications = await Application.find({
      applicant: user._id,
      status: { $in: CHAT_ENABLED_STATUSES },
    })
      .populate({
        path: "job",
        select: "title createdBy",
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    const contacts = [];
    const seenRecruiters = new Set();

    for (const application of applications) {
      if (!application.job?.createdBy) continue;

      const recruiterId = application.job.createdBy.toString();
      if (seenRecruiters.has(recruiterId)) continue;

      const recruiter = await User.findById(recruiterId).select(
        "name email role profile.profilePicture"
      );

      if (!recruiter) continue;

      seenRecruiters.add(recruiterId);
      contacts.push({
        _id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
        profilePicture: recruiter.profile?.profilePicture || "",
        applicationId: application._id,
        applicationStatus: application.status,
        jobTitle: application.job.title,
        canMessage: true,
      });
    }

    return contacts;
  }

  if (user.role === "recruiter") {
    const recruiterJobIds = await Job.find({ createdBy: user._id }).distinct("_id");

    if (!recruiterJobIds.length) {
      return [];
    }

    const applications = await Application.find({
      job: { $in: recruiterJobIds },
      status: { $in: CHAT_ENABLED_STATUSES },
    })
      .populate("applicant", "name email role profile.profilePicture")
      .populate("job", "title")
      .sort({ updatedAt: -1, createdAt: -1 });

    const contacts = [];
    const seenStudents = new Set();

    for (const application of applications) {
      if (!application.applicant?._id) continue;

      const studentId = application.applicant._id.toString();
      if (seenStudents.has(studentId)) continue;

      seenStudents.add(studentId);
      contacts.push({
        _id: application.applicant._id,
        name: application.applicant.name,
        email: application.applicant.email,
        role: application.applicant.role,
        profilePicture: application.applicant.profile?.profilePicture || "",
        applicationId: application._id,
        applicationStatus: application.status,
        jobTitle: application.job?.title || "",
        canMessage: true,
      });
    }

    return contacts;
  }

  return [];
};

const getChatAccess = async (currentUser, otherUserId) => {
  if (!otherUserId || currentUser._id.toString() === otherUserId.toString()) {
    return { allowed: false, reason: "Invalid chat recipient" };
  }

  const otherUser = await User.findById(otherUserId).select(
    "name email role profile.profilePicture"
  );

  if (!otherUser) {
    return { allowed: false, reason: "User not found" };
  }

  if (otherUser.role === currentUser.role || otherUser.role === "admin") {
    return {
      allowed: false,
      reason: "Messages are only allowed between matched students and recruiters",
    };
  }

  const recruiterId =
    currentUser.role === "recruiter" ? currentUser._id : otherUser._id;
  const studentId =
    currentUser.role === "student" ? currentUser._id : otherUser._id;

  const recruiterJobIds = await Job.find({ createdBy: recruiterId }).distinct("_id");

  if (!recruiterJobIds.length) {
    return {
      allowed: false,
      reason: "Messaging is unlocked only after a recruiter updates an application status",
    };
  }

  const application = await Application.findOne({
    applicant: studentId,
    job: { $in: recruiterJobIds },
    status: { $in: CHAT_ENABLED_STATUSES },
  })
    .populate("job", "title")
    .sort({ updatedAt: -1, createdAt: -1 });

  if (!application || !canStatusAccessChat(application.status)) {
    return {
      allowed: false,
      reason: "Messaging is unlocked only after the application status moves beyond pending",
    };
  }

  return {
    allowed: true,
    otherUser,
    application,
  };
};

module.exports = {
  CHAT_ENABLED_STATUSES,
  canStatusAccessChat,
  getAllowedChatContacts,
  getChatAccess,
};
