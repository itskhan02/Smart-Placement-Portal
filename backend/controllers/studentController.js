
const Application = require("../models/application");
const Job = require("../models/Job");
const User = require("../models/User");
const { extractText } = require("../utils/extractText");

const normalizeSkills = (skills) => {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => String(skill).trim().toLowerCase())
      .filter(Boolean);
  }

  return String(skills)
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
};

const getResumeAnalysisScore = async (user) => {

  if (!user?.profile?.resume?.fileUrl) {
    return {
      score: 0,
      suggestions: ["Upload your resume to get a score based on its quality."],
    };
  }

  if (
    user.profile.resumeAnalysisHistory &&
    user.profile.resumeAnalysisHistory.length > 0
  ) {
    const latestAnalysis = user.profile.resumeAnalysisHistory[0];
    if (latestAnalysis.score && latestAnalysis.score > 0) {
      return {
        score: latestAnalysis.score,
        suggestions: getSuggestionsFromAnalysis(latestAnalysis.analysis),
        analysis: latestAnalysis.analysis,
      };
    }
  }

  let score = 0;
  const suggestions = [];

  if (user.profile.resume?.fileUrl) {
    score += 30;
  } else {
    suggestions.push("Upload your resume file");
  }

  if (
    user.profile.resume?.fileName &&
    !user.profile.resume.fileName.includes("resume")
  ) {
    score += 5;
    suggestions.push(
      "Name your resume file professionally (e.g., YourName_Resume.pdf)",
    );
  }


  const skills = normalizeSkills(user.profile?.skills);
  if (skills.length > 0) {
    score += Math.min(25, skills.length * 3);
  } else {
    suggestions.push("Add skills to your profile to complement your resume");
  }


  const education = user.profile?.education || [];
  if (education.length > 0) {
    score += Math.min(20, education.length * 7);
  } else {
    suggestions.push("Add your education details");
  }


  const experience = user.profile?.experience || [];
  if (experience.length > 0) {
    score += Math.min(20, experience.length * 5);
  } else {
    suggestions.push("Add work experience or internships");
  }


  if (user.profile?.bio && user.profile.bio.length > 50) {
    score += 10;
  } else {
    suggestions.push("Write a detailed bio about yourself");
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    suggestions: suggestions.slice(0, 5),
  };
};


const getSuggestionsFromAnalysis = (analysis) => {
  if (!analysis) return ["Complete resume analysis for detailed suggestions"];

  const suggestions = [];

  if (analysis.weaknesses && analysis.weaknesses.length > 0) {
    suggestions.push(...analysis.weaknesses.slice(0, 3));
  }

  if (analysis.improvements && analysis.improvements.length > 0) {
    suggestions.push(analysis.improvements[0].text);
  }

  if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
    suggestions.push(
      `Add keywords: ${analysis.missingKeywords.slice(0, 3).join(", ")}`,
    );
  }

  return suggestions.length > 0
    ? suggestions.slice(0, 5)
    : ["Keep improving your resume for better matches"];
};


exports.getDashboard = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).populate("profile.company");
    const userSkills = normalizeSkills(user?.profile?.skills || []);

    const resumeScoreData = await getResumeAnalysisScore(user);
    const resumeScore = resumeScoreData.score;
    const resumeSuggestions = resumeScoreData.suggestions;

    const applications = await Application.find({
      applicant: req.user._id,
    }).populate({
      path: "job",
      populate: { path: "company" },
    });

    const jobs = await Job.find({
      is_active: true,
      status: "open",
    })
      .limit(5)
      .populate("company");

    const calculateJobMatch = ({ userSkills, jobSkills, resumeScore }) => {
      const safeUserSkills = normalizeSkills(userSkills);
      const safeJobSkills = normalizeSkills(jobSkills);
      const matchedSkills = safeJobSkills.filter((skill) =>
        safeUserSkills.includes(skill),
      );

      const skillMatch = safeJobSkills.length
        ? Math.round((matchedSkills.length / safeJobSkills.length) * 100)
        : 0;

      const overallMatch = Math.round(skillMatch * 0.6 + resumeScore * 0.4);

      return {
        skillMatch,
        resumeScore,
        overallMatch,
      };
    };

    const formattedJobs = jobs.map((job) => {
      const jobSkills = normalizeSkills(job.skillsrequired);
      const match = calculateJobMatch({
        userSkills,
        jobSkills,
        resumeScore,
      });

      return {
        _id: job._id,
        title: job.title || "No title",
        company: job.company,
        location: job.location || "N/A",
        salary: job.salary || "N/A",
        skills: jobSkills,
        skillMatch: match.skillMatch,
        resumeScore: match.resumeScore,
        match: match.overallMatch,
        postedAt: job.createdAt,
      };
    });

    const formattedApps = applications
      .map((application) => {
        if (!application.job) return null;

        const jobSkills = normalizeSkills(application.job.skillsrequired);
        const match = calculateJobMatch({
          userSkills,
          jobSkills,
          resumeScore,
        });

        return {
          _id: application._id,
          company: application.job?.company?.name || "Company",
          position: application.job?.title || "N/A",
          skillMatch: match.skillMatch,
          resumeScore: match.resumeScore,
          match: match.overallMatch,
          status: application.status || "pending",
          date: application.createdAt
            ? new Date(application.createdAt).toDateString()
            : "N/A",
        };
      })
      .filter(Boolean);

    const profileSuggestions = [];
    if (!user?.profile?.bio)
      profileSuggestions.push(
        "Add a short bio so recruiters can understand your profile faster.",
      );
    if (!(user?.profile?.skills || []).length)
      profileSuggestions.push("Add skills to improve your job match score.");
    if (!(user?.profile?.education || []).length)
      profileSuggestions.push(
        "Add your education details to complete your profile.",
      );

    const allSuggestions = [...resumeSuggestions, ...profileSuggestions].slice(
      0,
      6,
    );

    res.json({
      user: {
        name: user?.name || "User",
        email: user?.email || "",
        profilePicture: user?.profile?.profilePicture || "",
      },
      stats: {
        resumeScore,
        jobMatches: formattedJobs.length,
        applications: formattedApps.length,
        views: user?.profile?.views || 0,
        suggestions: allSuggestions,
      },
      jobs: formattedJobs,
      applications: formattedApps,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to load dashboard" });
  }
};
