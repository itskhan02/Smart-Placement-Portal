const Application = require("../models/application");
const Job = require("../models/Job");
const { notify } = require("../services/notificationService");
const { canStatusAccessChat } = require("../services/chatAccessService");


exports.applyJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    if(!jobId){
      return res.status(400).json({message: "Invalid job ID", success: false});
    }

    // Check if the user has already applied for the job
    const existingApplication = await Application.findOne({job: jobId, applicant: userId});

    if (existingApplication){
      return res.status(400).json({message: "You have already applied for this job", success: false});
    }

    //check if job exists

    const job = await Job.findById(jobId);
    if(!job){
      return res.status(404).json({message: "Job not found", success: false});
    }

    if (!job.is_active) {
      return res.status(400).json({message: "Job is closed",success: false,});
    }

    // Create a new application
    const application = new Application ({
      job: jobId,
      applicant: userId,
    });
    await application.save();
    job.application.push(application._id);
    await job.save();

    // Notify recruiter about new application
    await notify({
      userId: job.createdBy,
      role: "recruiter",
      type: "APPLICATION_SUBMITTED",
      title: "New Application Received",
      message: `A student has applied for your job: ${job.title}`,
      link: `/recruiter/applicants`,
      data: { jobId, applicationId: application._id }
    });
    

    return res.status(201).json({message: "Application submitted successfully", success: true});
  } catch (err) {
    return res.status(500).json({ message: "Error applying for job", success: false, error: err.message });
  }
};


//get applied jobs

exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await Application.find({ applicant: userId })
      .populate({
        path: "job",
        populate: {
          path: "createdBy",
          select: "name email role profile.profilePicture",
        },
      })
      .sort({ createdAt: -1 });

    // Populate company for each job
    await Application.populate(applications, {
      path: "job.company",
      model: "Company",
      select: "name logo location"
    });
    const formattedApplications = applications.map((application) => ({
      ...application.toObject(),
      canMessage: canStatusAccessChat(application.status),
      recruiter: application.job?.createdBy || null,
    }));

    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found", success: false });
    }

    return res.status(200).json({ applications: formattedApplications, success: true });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching applied jobs", success: false, error: err.message });
  }
};


//get applicants for a job

exports.getapplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findOne({
      _id: jobId,
      createdBy: req.user._id,
    }).populate({
      path: "application",
      populate: {
        path: "applicant",
        select: "name email profile.resume",
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      job,
      success: true,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Error fetching applicants",
      success: false,
      error: err.message,
    });
  }
};

//applicants for recruiter
exports.getAllApplicantsForRecruiter = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "job",
        match: { createdBy: req.user._id },
        select: "title"
      })
      .populate("applicant", "name email profile.resume")
      .sort({ createdAt: -1 });

    
    const filtered = applications
      .filter(app => app.job !== null)
      .map((app) => ({
        ...app.toObject(),
        canMessage: canStatusAccessChat(app.status),
      }));

    res.status(200).json({
      success: true,
      applications: filtered,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching applicants",
      error: err.message,
    });
  }
};

//update application status

exports.updateStatus= async (req, res) => {
  try {
    const {status} = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.status(400).json({message: "Invalid status", success: false});
    }

    //find application by id and update status
    const application = await Application.findById(applicationId);
    

    if (!application) {
      return res.status(404).json({message: "Application not found ", sucesss: false});
    }

    const validStatuses = ["pending", "reviewing", "accepted", "rejected"];

    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status",
        success: false,
      });
    }

    //update status
    application.status = status.toLowerCase();
    await application.save();

    // Notify applicant about status change
    await notify({
      userId: application.applicant,
      role: "student",
      type: "APPLICATION_STATUS",
      title: "Application Status Updated",
      message: `Your application status has been updated to: ${status}`,
      link: `/student/application`,
      data: { applicationId, jobId: application.job, status: application.status }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("statsUpdated");
    }

    return res.status(200).json({message: "Application status updated successfully", success: true});

  } catch (err) {
    return res.status(500).json({message: "Error updating application status", success: false, error: err.message});
  }
};

// Delete only stale applications whose job has already been removed.
exports.deleteDeletedJobApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    if (
      req.user.role !== "admin" &&
      application.applicant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only remove your own application",
        success: false,
      });
    }

    const job = await Job.findById(application.job);

    if (job) {
      return res.status(400).json({
        message: "This job still exists and cannot be removed from applications",
        success: false,
      });
    }

    await Application.findByIdAndDelete(application._id);

    const io = req.app.get("io");
    if (io) {
      io.emit("statsUpdated");
    }

    return res.status(200).json({
      message: "Deleted job application removed successfully",
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error removing deleted job application",
      success: false,
      error: err.message,
    });
  }
};
