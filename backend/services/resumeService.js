const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// Initialize AI clients (only if API keys are configured)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Available models (ordered by preference)
const GEMINI_MODELS = [
  "gemini-1.5-flash-001",
  "gemini-1.5-pro-001",
  "gemini-1.0-pro",
  "gemini-pro",
];

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

// Track which provider worked last time (for faster subsequent calls)
let lastSuccessfulProvider = null;

// ============= BUILD PROMPT =============
function buildPrompt(resumeText, jobDescription) {
  const hasJobDescription =
    jobDescription && jobDescription.trim().length >= 20;

  return `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze this resume${hasJobDescription ? " against the job description" : ""}.

RESUME TEXT:
"""
${resumeText.substring(0, 8000)}
"""

${
  hasJobDescription
    ? `JOB DESCRIPTION:
"""
${jobDescription.substring(0, 3000)}
"""`
    : "No job description. Give general resume improvement advice."
}

Return ONLY a valid JSON object with this structure:
{
  "score": 65,
  "atsScore": 60,
  "summary": "2-3 sentence professional analysis",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "improvements": [
    {"text": "actionable improvement", "priority": "high", "category": "keywords", "impact": "impact description"}
  ],
  "detectedSkills": ["skill found in resume", "another skill"],
  "missingKeywords": ["important missing keyword", "another keyword"],
  "sectionScores": {
    "atsCompatibility": 50,
    "skills": 50,
    "experience": 50,
    "education": 50,
    "formatting": 50,
    "impact": 40,
    "keywords": 40
  },
  "detailedFeedback": {
    "skillsFeedback": "specific skills feedback",
    "experienceFeedback": "specific experience feedback",
    "educationFeedback": "specific education feedback",
    "formattingFeedback": "specific formatting feedback",
    "keywordFeedback": "specific keyword feedback"
  },
  "actionPlan": [
    {"step": 1, "action": "what to do", "reason": "why it matters", "effort": "medium", "impact": "high"}
  ],
  "matchAnalysis": {
    "technicalSkillsMatch": 50,
    "softSkillsMatch": 50,
    "experienceLevelMatch": 50,
    "educationMatch": 50,
    "overallFit": 50
  },
  "atsTips": ["ATS tip 1", "ATS tip 2", "ATS tip 3"],
  "formatIssues": ["formatting issue found"],
  "recommendedFormats": ["format suggestion"]
}

RULES:
- Be HONEST. Score realistically (most resumes score 40-70).
- Only list skills ACTUALLY in the resume text.
- Give SPECIFIC, ACTIONABLE feedback.
- If text is not a professional resume, score below 20.`;
}

// ============= GEMINI ATTEMPT =============
async function tryGemini(resumeText, jobDescription) {
  if (!genAI) {
    console.log("⚠️ Gemini not configured (no GEMINI_API_KEY)");
    return null;
  }

  const prompt = buildPrompt(resumeText, jobDescription);

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`🟡 GEMINI: Trying ${model}...`);
      const genModel = genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let jsonStr = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];

      const analysis = JSON.parse(jsonStr);
      console.log(`✅ GEMINI (${model}): Score=${analysis.score}`);
      lastSuccessfulProvider = "gemini";
      return { analysis, provider: "gemini", model };
    } catch (err) {
      console.log(`❌ GEMINI ${model}: ${err.message}`);
    }
  }

  console.log("❌ All Gemini models failed");
  return null;
}

// ============= GROQ ATTEMPT =============
async function tryGroq(resumeText, jobDescription) {
  if (!groq) {
    console.log("⚠️ Groq not configured (no GROQ_API_KEY)");
    return null;
  }

  const prompt = buildPrompt(resumeText, jobDescription);

  for (const model of GROQ_MODELS) {
    try {
      console.log(`🟡 GROQ: Trying ${model}...`);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a resume analyzer. Respond with ONLY valid JSON. No markdown, no code blocks, no explanations.",
          },
          { role: "user", content: prompt },
        ],
        model: model,
        temperature: 0.2,
        max_tokens: 3000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      let jsonStr = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];

      const analysis = JSON.parse(jsonStr);
      console.log(`✅ GROQ (${model}): Score=${analysis.score}`);
      lastSuccessfulProvider = "groq";
      return { analysis, provider: "groq", model };
    } catch (err) {
      console.log(`❌ GROQ ${model}: ${err.message}`);
    }
  }

  console.log("❌ All Groq models failed");
  return null;
}

// ============= MAIN ANALYZER =============
const analyzeResumeWithGemini = async (resumeText, jobDescription) => {
  // Validation
  if (!resumeText || resumeText.trim().length < 50) {
    console.log("⚠️ Resume too short (min 50 chars)");
    return getFallbackAnalysis("resume_too_short");
  }

  // Check if any provider is configured
  if (!genAI && !groq) {
    console.error(
      "❌ No AI provider configured! Set GEMINI_API_KEY or GROQ_API_KEY",
    );
    return getFallbackAnalysis("no_provider");
  }

  let result = null;
  const errors = [];

  // Try last successful provider first (faster)
  if (lastSuccessfulProvider === "gemini" && genAI) {
    console.log("🔄 Trying last successful provider: Gemini");
    result = await tryGemini(resumeText, jobDescription);
  } else if (lastSuccessfulProvider === "groq" && groq) {
    console.log("🔄 Trying last successful provider: Groq");
    result = await tryGroq(resumeText, jobDescription);
  }

  // If last provider failed, try the other one
  if (!result) {
    // Try Gemini first (free)
    if (genAI) {
      result = await tryGemini(resumeText, jobDescription);
      if (!result) errors.push("Gemini: All models failed");
    }

    // Fallback to Groq (also free)
    if (!result && groq) {
      console.log("🔄 Falling back to Groq...");
      result = await tryGroq(resumeText, jobDescription);
      if (!result) errors.push("Groq: All models failed");
    }
  }

  // Return result or fallback
  if (result) {
    return validateAndReturnAnalysis(result.analysis);
  }

  console.error("❌ ALL PROVIDERS FAILED:", errors);
  return getFallbackAnalysis("all_failed");
};

// ============= VALIDATION =============
function clamp(val, min, max, fallback) {
  if (typeof val !== "number" || isNaN(val)) return fallback;
  return Math.max(min, Math.min(max, Math.round(val)));
}

function arr(val, fallback) {
  return Array.isArray(val) && val.length > 0 ? val : fallback;
}

function validateAndReturnAnalysis(a) {
  return {
    score: clamp(a.score, 0, 100, 50),
    atsScore: clamp(a.atsScore, 0, 100, 45),
    summary: a.summary || "Analysis completed.",
    strengths: arr(a.strengths, ["Resume processed"]),
    weaknesses: arr(a.weaknesses, []),
    improvements: arr(a.improvements, [
      {
        text: "Add more keywords",
        priority: "high",
        category: "keywords",
        impact: "ATS matching",
      },
      {
        text: "Quantify achievements",
        priority: "high",
        category: "achievements",
        impact: "Clearer impact",
      },
      {
        text: "Use action verbs",
        priority: "medium",
        category: "formatting",
        impact: "Better readability",
      },
    ]).map((i) => ({
      text: i.text || "Improve",
      priority: ["high", "medium", "low"].includes(i.priority)
        ? i.priority
        : "medium",
      category: i.category || "general",
      impact: i.impact || "Improves quality",
    })),
    detectedSkills: arr(a.detectedSkills, []),
    missingKeywords: arr(a.missingKeywords, []),
    sectionScores: {
      atsCompatibility: clamp(a.sectionScores?.atsCompatibility, 0, 100, 50),
      skills: clamp(a.sectionScores?.skills, 0, 100, 50),
      experience: clamp(a.sectionScores?.experience, 0, 100, 50),
      education: clamp(a.sectionScores?.education, 0, 100, 50),
      formatting: clamp(a.sectionScores?.formatting, 0, 100, 50),
      impact: clamp(a.sectionScores?.impact, 0, 100, 40),
      keywords: clamp(a.sectionScores?.keywords, 0, 100, 40),
    },
    detailedFeedback: {
      skillsFeedback:
        a.detailedFeedback?.skillsFeedback || "Add relevant skills.",
      experienceFeedback:
        a.detailedFeedback?.experienceFeedback || "Quantify achievements.",
      educationFeedback:
        a.detailedFeedback?.educationFeedback || "List education clearly.",
      formattingFeedback:
        a.detailedFeedback?.formattingFeedback || "Use clean format.",
      keywordFeedback:
        a.detailedFeedback?.keywordFeedback || "Include keywords.",
    },
    actionPlan: arr(a.actionPlan, [
      {
        step: 1,
        action: "Review job description",
        reason: "Know requirements",
        effort: "low",
        impact: "high",
      },
      {
        step: 2,
        action: "Add missing keywords",
        reason: "ATS filters keywords",
        effort: "medium",
        impact: "high",
      },
      {
        step: 3,
        action: "Quantify results",
        reason: "Numbers prove impact",
        effort: "medium",
        impact: "high",
      },
    ]).map((s, i) => ({
      step: s.step || i + 1,
      action: s.action || "Improve",
      reason: s.reason || "Better chances",
      effort: ["low", "medium", "high"].includes(s.effort)
        ? s.effort
        : "medium",
      impact: ["low", "medium", "high"].includes(s.impact) ? s.impact : "high",
    })),
    matchAnalysis: {
      technicalSkillsMatch: clamp(
        a.matchAnalysis?.technicalSkillsMatch,
        0,
        100,
        50,
      ),
      softSkillsMatch: clamp(a.matchAnalysis?.softSkillsMatch, 0, 100, 50),
      experienceLevelMatch: clamp(
        a.matchAnalysis?.experienceLevelMatch,
        0,
        100,
        50,
      ),
      educationMatch: clamp(a.matchAnalysis?.educationMatch, 0, 100, 50),
      overallFit: clamp(a.matchAnalysis?.overallFit, 0, 100, 50),
    },
    atsTips: arr(a.atsTips, [
      "Use standard headings",
      "Avoid images/tables",
      "Include keywords",
    ]),
    formatIssues: arr(a.formatIssues, []),
    recommendedFormats: arr(a.recommendedFormats, [
      "Chronological format",
      "Keep 1-2 pages",
    ]),
  };
}

// ============= FALLBACK =============
function getFallbackAnalysis(reason) {
  const msgs = {
    resume_too_short:
      "Resume text too short. Upload a complete resume (min 50 characters).",
    no_provider:
      "No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env",
    all_failed:
      "All AI services temporarily unavailable. Here are general tips.",
  };

  return {
    score: 0,
    atsScore: 0,
    summary: msgs[reason] || "Analysis unavailable. Try again later.",
    strengths: [],
    weaknesses: ["Analysis could not be completed"],
    improvements: [
      {
        text: "Upload a text-based PDF or DOCX",
        priority: "high",
        category: "formatting",
        impact: "Required",
      },
      {
        text: "Try again in a few moments",
        priority: "high",
        category: "other",
        impact: "Service may recover",
      },
    ],
    detectedSkills: [],
    missingKeywords: [],
    sectionScores: {
      atsCompatibility: 0,
      skills: 0,
      experience: 0,
      education: 0,
      formatting: 0,
      impact: 0,
      keywords: 0,
    },
    detailedFeedback: {
      skillsFeedback: "Unavailable.",
      experienceFeedback: "Unavailable.",
      educationFeedback: "Unavailable.",
      formattingFeedback: "Unavailable.",
      keywordFeedback: "Unavailable.",
    },
    actionPlan: [
      {
        step: 1,
        action: "Upload a valid resume",
        reason: "Required",
        effort: "low",
        impact: "high",
      },
    ],
    matchAnalysis: {
      technicalSkillsMatch: 0,
      softSkillsMatch: 0,
      experienceLevelMatch: 0,
      educationMatch: 0,
      overallFit: 0,
    },
    atsTips: ["Use standard headings", "Avoid images", "Include keywords"],
    formatIssues: ["Unable to analyze"],
    recommendedFormats: ["Upload PDF or DOCX"],
  };
}

module.exports = { analyzeResumeWithGemini };
