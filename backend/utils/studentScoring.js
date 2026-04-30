const normalizeSkills = (skills = []) => {
  if (!skills) return [];

  const rawSkills = Array.isArray(skills) ? skills : String(skills).split(",");

  return [...new Set(
    rawSkills
      .map((skill) => String(skill || "").trim().toLowerCase())
      .filter(Boolean)
  )];
};

const calculateResumeScore = (user) => {
  let score = 0;

  const bio = user?.profile?.bio?.trim() || "";
  const skills = normalizeSkills(user?.profile?.skills);
  const education = user?.profile?.education || [];
  const experience = user?.profile?.experience || [];

  if (bio.length >= 30) score += 15;
  else if (bio.length >= 10) score += 8;

  if (user?.profile?.profilePicture) score += 5;
  if (user?.profile?.location?.trim()) score += 5;

  score += Math.min(25, skills.length * 5);
  score += Math.min(15, education.length * 8);
  score += Math.min(15, experience.length * 8);

  if (user?.profile?.resume?.fileUrl) score += 10;
  if (user?.profile?.linkedin?.trim()) score += 5;
  if (user?.name?.trim()) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const calculateSkillMatch = (userSkills = [], jobSkills = []) => {
  const normalizedUserSkills = normalizeSkills(userSkills);
  const normalizedJobSkills = normalizeSkills(jobSkills);

  if (normalizedJobSkills.length === 0) {
    return 50;
  }

  const matchedSkills = normalizedJobSkills.filter((jobSkill) =>
    normalizedUserSkills.some(
      (userSkill) =>
        userSkill === jobSkill ||
        userSkill.includes(jobSkill) ||
        jobSkill.includes(userSkill)
    )
  );

  return Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
};

const calculateJobMatch = ({
  userSkills = [],
  jobSkills = [],
  resumeScore = 0,
}) => {
  const skillMatch = calculateSkillMatch(userSkills, jobSkills);
  const overallMatch = Math.round(skillMatch * 0.7 + resumeScore * 0.3);

  return {
    skillMatch,
    resumeScore,
    overallMatch: Math.max(0, Math.min(100, overallMatch)),
  };
};

const getProfileSuggestions = (user) => {
  const suggestions = [];

  if (!user?.profile?.bio || user.profile.bio.trim().length < 30) {
    suggestions.push("Add a stronger bio with your goals, tools, and strengths.");
  }

  if (!user?.profile?.profilePicture) {
    suggestions.push("Add a profile picture for a more complete student profile.");
  }

  if (!user?.profile?.location?.trim()) {
    suggestions.push("Add your current location so recruiters can find nearby roles.");
  }

  if (!user?.profile?.skills || user.profile.skills.length < 5) {
    suggestions.push("Add more relevant technical skills to improve matching.");
  }

  if (!user?.profile?.education || user.profile.education.length === 0) {
    suggestions.push("Add your education details.");
  }

  if (!user?.profile?.experience || user.profile.experience.length === 0) {
    suggestions.push("Add internships, projects, or work experience.");
  }

  if (!user?.profile?.resume?.fileUrl) {
    suggestions.push("Upload your resume so recruiters can review it.");
  }

  return suggestions.length ? suggestions : ["Your profile looks strong. Keep tailoring it for each job."];
};

const buildStudentSnapshot = (user) => {
  const skills = normalizeSkills(user?.profile?.skills);
  const education = (user?.profile?.education || [])
    .map((item) => `${item.degree || ""} ${item.field ? `in ${item.field}` : ""} (${item.startYear || ""}-${item.endYear || ""})`.trim())
    .filter(Boolean);
  const experience = (user?.profile?.experience || [])
    .map((item) => `${item.title || ""}${item.duration ? ` - ${item.duration}` : ""}`.trim())
    .filter(Boolean);

  return {
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    skills,
    education,
    experience,
    linkedin: user?.profile?.linkedin || "",
    resumeFileName: user?.profile?.resume?.fileName || "",
  };
};

module.exports = {
  normalizeSkills,
  calculateResumeScore,
  calculateSkillMatch,
  calculateJobMatch,
  getProfileSuggestions,
  buildStudentSnapshot,
};
