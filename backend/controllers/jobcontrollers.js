const Job = require("../models/Job");
const User = require("../models/User");
const Company = require("../models/Company");
const Application = require("../models/Application");

// create jobs

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      location,
      experience,
      salary,
      description,
      skillsrequired,
      jobType,
    } = req.body;

    const user = req.user;

    if (!user.profile.company) {
      return res.status(400).json({
        success: false,
        msg: "Please create a company first",
      });
    }

    const job = await Job.create({
      title,
      company: user.profile.company,
      location,
      experience,
      salary: salary.trim(),
      description,
      skillsrequired: skillsrequired
        .split(",")
        .map((s) => s.trim().toLowerCase()),
      jobType,
      createdBy: user._id,
    });

    res.status(201).json({
      success: true,
      msg: "Job posted successfully",
      job,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate("company", "name")
      .sort({ createdAt: -1 });

    const formattedJobs = jobs.map((job) => ({
      ...job._doc,
      applicationsCount: job.application.length,
    }));

    res.json({
      success: true,
      total: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// exports.getAllJobs = async (req, res) => {
//   try {
//     const jobs = await Job.find({
//       createdBy: req.user._id,
//     })
//       .populate(  "company", "name logo")
//       .populate("application")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       total: jobs.length,
//       jobs,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       msg: err.message || "could not fetch jobs",
//     });
//   }
// };

// get single job
exports.getbyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate({ path: "company" });
    if (!job) {
      return res.status(404).json({ success: false, msg: "Job not found" });
    }
    return res.status(200).json({ success: true, job });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, msg: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Job.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "Job Deleted Successfully", success: true });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

//toggle job status

exports.toggleStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        msg: "Job not found",
      });
    }

    if (
      !req.user ||
      !job.createdBy ||
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized",
      });
    }

    job.is_active = !job.is_active;

    await job.save();

    return res.status(200).json({
      success: true,
      msg: "Job status updated",
      is_active: job.is_active,
    });
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    return res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};


// get job for students
exports.getAllJobsForStudents = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, location, jobType, sort = 'newest' } = req.query;

    const matchConditions = {
      is_active: true,
    };

    // location filter
    if (location) {
      if (location === 'Remote') {
        matchConditions.location = 'Remote';
      } else {
        matchConditions.location = { $regex: `\\b${location}\\b`, $options: 'i' };
      }
    }

    //  job type filter
    if (jobType) {
      matchConditions.jobType = jobType;
    }

    //  sort object
    let sortOption = { createdAt: -1 }; 
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'salary-high':
        sortOption = { salaryNumeric: -1 };
        break;
      case 'salary-low':
        sortOption = { salaryNumeric: 1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    let jobs;

    if (search) {
  // search filter
      jobs = await Job.aggregate([
        {
          $match: matchConditions
        },
        {
          $lookup: {
            from: 'companies',
            localField: 'company',
            foreignField: '_id',
            as: 'company'
          }
        },
        {
          $unwind: '$company'
        },
        {
          $match: {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { 'company.name': { $regex: search, $options: 'i' } }
            ]
          }
        },
        {
          $addFields: {
            salaryNumeric: {
              $convert: {
                input: {
                  $replaceAll: {
                    input: { $replaceAll: { input: "$salary", find: ",", replacement: "" } },
                    find: "₹",
                    replacement: ""
                  }
                },
                to: "double",
                onError: 0,
                onNull: 0
              }
            }
          }
        },
        {
          $sort: sortOption
        },
        {
          $project: {
            title: 1,
            location: 1,
            experience: 1,
            salary: 1,
            description: 1,
            skillsrequired: 1,
            jobType: 1,
            status: 1,
            is_active: 1,
            createdAt: 1,
            updatedAt: 1,
            company: {
              _id: '$company._id',
              name: '$company.name',
              logo: '$company.logo',
              location: '$company.location'
            }
          }
        }
      ]);
    } else {
  
      if (sort === 'salary-high' || sort === 'salary-low') {
        jobs = await Job.aggregate([
          { $match: matchConditions },
          {
            $lookup: {
              from: 'companies',
              localField: 'company',
              foreignField: '_id',
              as: 'company'
            }
          },
          {
            $unwind: '$company'
          },
          {
            $addFields: {
              salaryNumeric: {
                $convert: {
                  input: {
                    $replaceAll: {
                      input: { $replaceAll: { input: "$salary", find: ",", replacement: "" } },
                      find: "₹",
                      replacement: ""
                    }
                  },
                  to: "double",
                  onError: 0,
                  onNull: 0
                }
              }
            }
          },
          { $sort: sortOption },
          {
            $project: {
              title: 1,
              location: 1,
              experience: 1,
              salary: 1,
              description: 1,
              skillsrequired: 1,
              jobType: 1,
              status: 1,
              is_active: 1,
              createdAt: 1,
              updatedAt: 1,
              company: {
                _id: '$company._id',
                name: '$company.name',
                logo: '$company.logo',
                location: '$company.location'
              }
            }
          }
        ]);
      } else {
        jobs = await Job.find(matchConditions)
          .populate({
            path: "company",
            select: "name logo location"
          })
          .sort(sortOption)
          .lean();
      }
    }

    const applications = await Application.find({
      applicant: userId,
    }).select("job");

    const appliedJobIds = applications.map((a) => a.job.toString());

    const jobsWithApplied = jobs.map((job) => ({
      ...job,
      applied: appliedJobIds.includes(String(job._id)),
      postedAt: job.createdAt,
    }));

    res.status(200).json({
      success: true,
      total: jobsWithApplied.length,
      jobs: jobsWithApplied,
    });
  } catch (err) {
    console.error("STUDENT JOB FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};


//get single job for students
exports.getJobForStudent = async (req, res) => {
  try {
    const userId = req.user._id;

    const job = await Job.findById(req.params.id)
      .populate({
        path: "company", 
        select: "name logo location website description"  
      })
      .lean();

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const existing = await Application.findOne({
      job: job._id,
      applicant: userId,
    });

    job.applied = !!existing;

    res.json({ job });
  } catch (err) {
    console.error("Error in getJobForStudent:", err);
    res.status(500).json({ msg: err.message });
  }
};