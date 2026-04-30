const Job = require("../models/Job");
const Application = require("../models/application");

exports.getAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const jobs = await Job.find({ createdBy: recruiterId });

    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({
      job: { $in: jobIds }
    });

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.is_active).length;
    const inactiveJobs = totalJobs - activeJobs;

    const totalApplications = applications.length;

    let statusCount = {
      pending: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0,
    };

    applications.forEach(app => {
      if (statusCount[app.status] !== undefined) {
        statusCount[app.status]++;
      }
    });

    // 🔥 KEY FIX (IMPORTANT)
    const applicationPerJob = jobs.map(job => {
      const count = applications.filter(app =>
        app.job.toString() === job._id.toString()
      ).length;

      return {
        name: job.title,
        applications: count,
      };
    });

    const resumeViewed = new Set(
      applications
        .filter((app) => app.status === "reviewing") 
        .map((app) => app.applicant?.toString()),
    ).size;

    return res.json({
      totalJobs,
      activeJobs,
      inactiveJobs,
      totalApplications,
      statusCount,
      resumeViewed,
      applicationPerJob,
      growth: {
        newJobs: 0,
        newActiveJobs: 0,
        newApplications: 0,
        newResumes: 0,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};