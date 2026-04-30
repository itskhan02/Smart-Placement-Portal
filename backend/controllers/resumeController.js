const fs = require("fs");
const path = require("path");
const { extractText } = require("../utils/extractText");
const { analyzeResumeWithGemini } = require("../services/resumeService");
const User = require("../models/User");

exports.analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    const file = req.file;
    const { jobDescription, jobTitle, jobId } = req.body;

    // Validate file
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    filePath = file.path;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message: "File size must be less than 5MB",
      });
    }

    // Extract text from resume
    const resumeText = await extractText(file.path, file.mimetype);

    if (!resumeText || resumeText.trim().length < 50) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message:
          "Could not extract enough text from the resume. The file may be image-based, empty, or corrupted. Please upload a text-based PDF or DOCX file.",
        extractedLength: resumeText?.length || 0,
      });
    }

    // Analyze resume with AI
    const analysis = await analyzeResumeWithGemini(
      resumeText,
      jobDescription || "",
    );

    // Save analysis to user's profile
    const user = await User.findById(req.user._id);

    if (!user) {
      cleanupFile(filePath);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store the resume file info in user profile
    user.profile.resume = {
      fileName: file.originalname,
      fileUrl: `/uploads/resumes/${file.filename}`,
      uploadedAt: new Date(),
    };

    // Store analysis history in user profile
    if (!user.profile.resumeAnalysisHistory) {
      user.profile.resumeAnalysisHistory = [];
    }

    // Add new analysis to history (keep last 10)
    user.profile.resumeAnalysisHistory.unshift({
      fileName: file.originalname,
      fileUrl: `/uploads/resumes/${file.filename}`,
      jobDescription: jobDescription || "",
      jobTitle: jobTitle || "",
      jobId: jobId || null,
      score: analysis.score,
      atsScore: analysis.atsScore,
      analysis: analysis,
      extractedText: resumeText.substring(0, 5000), // Store first 5000 chars for reference
      createdAt: new Date(),
    });

    // Keep only last 10 analyses
    if (user.profile.resumeAnalysisHistory.length > 10) {
      user.profile.resumeAnalysisHistory =
        user.profile.resumeAnalysisHistory.slice(0, 10);
    }

    await user.save();

    return res.json({
      success: true,
      analysis,
      historyId: user.profile.resumeAnalysisHistory[0]._id,
      meta: {
        resumeLength: resumeText.length,
        jobDescriptionLength: (jobDescription || "").length,
        extractedAt: new Date().toISOString(),
        fileName: file.originalname,
      },
    });
  } catch (err) {
    console.error("Resume analysis error:", err);
    cleanupFile(filePath);

    res.status(500).json({
      success: false,
      message: err.message || "Analysis failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Get analysis history
exports.getAnalysisHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "profile.resumeAnalysisHistory",
    );

    if (!user || !user.profile.resumeAnalysisHistory) {
      return res.json({
        success: true,
        history: [],
        total: 0,
      });
    }

    // Return history without the full analysis object to reduce payload
    const history = user.profile.resumeAnalysisHistory.map((item) => ({
      _id: item._id,
      fileName: item.fileName,
      score: item.score,
      atsScore: item.atsScore,
      jobTitle: item.jobTitle,
      jobDescription: item.jobDescription?.substring(0, 100),
      createdAt: item.createdAt,
    }));

    res.json({
      success: true,
      history,
      total: history.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis history",
    });
  }
};

// Get single analysis by history ID
exports.getAnalysisById = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "profile.resumeAnalysisHistory",
    );

    if (!user || !user.profile.resumeAnalysisHistory) {
      return res.status(404).json({
        success: false,
        message: "No analysis history found",
      });
    }

    const analysisItem = user.profile.resumeAnalysisHistory.id(req.params.id);

    if (!analysisItem) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    res.json({
      success: true,
      analysis: analysisItem.analysis,
      meta: {
        fileName: analysisItem.fileName,
        score: analysisItem.score,
        atsScore: analysisItem.atsScore,
        jobTitle: analysisItem.jobTitle,
        analyzedAt: analysisItem.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
    });
  }
};

// Compare two analyses
exports.compareAnalyses = async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    const user = await User.findById(req.user._id).select(
      "profile.resumeAnalysisHistory",
    );

    if (!user || !user.profile.resumeAnalysisHistory) {
      return res.status(404).json({
        success: false,
        message: "No analysis history found",
      });
    }

    const analysis1 = user.profile.resumeAnalysisHistory.id(id1);
    const analysis2 = user.profile.resumeAnalysisHistory.id(id2);

    if (!analysis1 || !analysis2) {
      return res.status(404).json({
        success: false,
        message: "One or both analyses not found",
      });
    }

    const comparison = {
      score: {
        resume1: analysis1.score,
        resume2: analysis2.score,
        difference: analysis2.score - analysis1.score,
        improved: analysis2.score > analysis1.score,
      },
      atsScore: {
        resume1: analysis1.atsScore,
        resume2: analysis2.atsScore,
        difference: analysis2.atsScore - analysis1.atsScore,
        improved: analysis2.atsScore > analysis1.atsScore,
      },
      sectionComparison: compareSections(
        analysis1.analysis?.sectionScores,
        analysis2.analysis?.sectionScores,
      ),
      skillComparison: {
        resume1Skills: analysis1.analysis?.detectedSkills || [],
        resume2Skills: analysis2.analysis?.detectedSkills || [],
        newSkills: findNewItems(
          analysis1.analysis?.detectedSkills,
          analysis2.analysis?.detectedSkills,
        ),
        removedSkills: findNewItems(
          analysis2.analysis?.detectedSkills,
          analysis1.analysis?.detectedSkills,
        ),
      },
      keywordComparison: {
        resume1Missing: analysis1.analysis?.missingKeywords || [],
        resume2Missing: analysis2.analysis?.missingKeywords || [],
        newMissing: findNewItems(
          analysis1.analysis?.missingKeywords,
          analysis2.analysis?.missingKeywords,
        ),
        resolved: findNewItems(
          analysis2.analysis?.missingKeywords,
          analysis1.analysis?.missingKeywords,
        ),
      },
    };

    res.json({
      success: true,
      comparison,
      resume1: { fileName: analysis1.fileName, date: analysis1.createdAt },
      resume2: { fileName: analysis2.fileName, date: analysis2.createdAt },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Comparison failed",
    });
  }
};

// Delete an analysis from history
exports.deleteAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.profile.resumeAnalysisHistory) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    // Remove the analysis from history
    user.profile.resumeAnalysisHistory.pull(req.params.id);
    await user.save();

    res.json({
      success: true,
      message: "Analysis deleted from history",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete analysis",
    });
  }
};

// Helper functions
function cleanupFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("File cleanup error:", err);
    }
  }
}

function compareSections(sections1 = {}, sections2 = {}) {
  const comparison = {};
  const allKeys = new Set([
    ...Object.keys(sections1),
    ...Object.keys(sections2),
  ]);

  allKeys.forEach((key) => {
    const val1 = sections1[key] || 0;
    const val2 = sections2[key] || 0;
    comparison[key] = {
      analysis1: val1,
      analysis2: val2,
      difference: val2 - val1,
      improved: val2 > val1,
    };
  });

  return comparison;
}

function findNewItems(oldArray = [], newArray = []) {
  const oldSet = new Set(oldArray.map((i) => i.toLowerCase()));
  return newArray.filter((i) => !oldSet.has(i.toLowerCase()));
}
