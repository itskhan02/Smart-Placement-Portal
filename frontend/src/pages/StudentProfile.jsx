import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Mail,
  User,
  Calendar,
  Award,
} from "lucide-react";
import api from "../utils/api";

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
  });
  const [experience, setExperience] = useState([]);
  const [newExperience, setNewExperience] = useState({
    title: "",
    duration: "",
  });
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/users/profile");
      setUser(res.data.user);
      setFormData({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        bio: res.data.user.profile?.bio || "",
        location: res.data.user.profile?.location || "",
      });
      setSkills(res.data.user.profile?.skills || []);
      setEducation(res.data.user.profile?.education || []);
      setExperience(res.data.user.profile?.experience || []);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to load profile";
      setError(errorMsg);
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }

      const res = await api.put("/users/profile/update", {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
      });
      setUser(res.data.user);
      setIsEditing(false);
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to update profile";
      setError(errorMsg);
      clearMessages();
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.profile?.bio || "",
      location: user?.profile?.location || "",
    });
    setSkills(user?.profile?.skills || []);
    setEducation(user?.profile?.education || []);
    setExperience(user?.profile?.experience || []);
    setSkillInput("");
    setNewEducation({ degree: "", field: "", startYear: "", endYear: "" });
    setNewExperience({ title: "", duration: "" });
    setIsEditing(false);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload an image file (JPEG, PNG, GIF, or WebP)");
      clearMessages();
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      clearMessages();
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setError(null);
      setProfilePicLoading(true);
      const res = await api.put("/users/profile/picture", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to upload profile picture";
      setError(errorMsg);
      clearMessages();
    } finally {
      setProfilePicLoading(false);
    }
  };

  const addSkill = async () => {
    if (!skillInput.trim()) {
      setError("Skill cannot be empty");
      return;
    }

    const skillLower = skillInput.trim().toLowerCase();
    if (skills.includes(skillLower)) {
      setError("This skill already exists");
      return;
    }

    const updatedSkills = [...skills, skillLower];
    try {
      setError(null);
      const res = await api.put("/users/profile/skills", {
        skills: updatedSkills,
      });
      setSkills(res.data.user.profile?.skills || []);
      setSkillInput("");
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to add skill";
      setError(errorMsg);
      clearMessages();
    }
  };

  const removeSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter((s) => s !== skillToRemove);
    try {
      setError(null);
      const res = await api.put("/users/profile/skills", {
        skills: updatedSkills,
      });
      setSkills(res.data.user.profile?.skills || []);
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to remove skill";
      setError(errorMsg);
      clearMessages();
    }
  };

  const addEducationEntry = async () => {
    try {
      setError(null);
      if (!newEducation.degree.trim() || !newEducation.field.trim()) {
        setError("Degree and field are required");
        return;
      }

      const res = await api.post("/users/profile/education", {
        education: newEducation,
      });
      setEducation(res.data.user.profile?.education || []);
      setNewEducation({ degree: "", field: "", startYear: "", endYear: "" });
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to add education";
      setError(errorMsg);
      clearMessages();
    }
  };

  const deleteEducationEntry = async (index) => {
    try {
      setError(null);
      const res = await api.delete(`/users/profile/education/${index}`);
      setEducation(res.data.user.profile?.education || []);
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to delete education";
      setError(errorMsg);
      clearMessages();
    }
  };

  const addExperienceEntry = async () => {
    try {
      setError(null);
      if (!newExperience.title.trim()) {
        setError("Job title is required");
        return;
      }

      const res = await api.post("/users/profile/experience", {
        experience: newExperience,
      });
      setExperience(res.data.user.profile?.experience || []);
      setNewExperience({ title: "", duration: "" });
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to add experience";
      setError(errorMsg);
      clearMessages();
    }
  };

  const deleteExperienceEntry = async (index) => {
    try {
      setError(null);
      const res = await api.delete(`/users/profile/experience/${index}`);
      setExperience(res.data.user.profile?.experience || []);
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to delete experience";
      setError(errorMsg);
      clearMessages();
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or Word document");
      clearMessages();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      clearMessages();
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("resume", file);

    try {
      setError(null);
      setResumeLoading(true);
      const res = await api.post("/users/profile/resume", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      clearMessages();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to upload resume";
      setError(errorMsg);
      clearMessages();
    } finally {
      setResumeLoading(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (!user?.profile?.profilePicture) return null;
    const pic = user.profile.profilePicture;
    if (pic.startsWith("http")) return pic;
    if (pic.startsWith("/uploads")) return `http://localhost:8000${pic}`;
    return `http://localhost:8000/uploads/profiles/${pic}`;
  };

  if (loading) {
    return (
      <Layout role="student">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const profilePicUrl = getProfilePictureUrl();

  return (
    <Layout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-xl text-white flex justify-between">
          <div className="flex gap-5 items-center">
            {/* Profile Pic */}
            <div className="relative">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt={formData.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white text-white text-3xl font-bold shadow-lg">
                  {formData.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <label className="absolute bottom-1 right-1 bg-white text-blue-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition shadow-md">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={profilePicLoading}
                />
              </label>
            </div>

            <div>
              <h1 className="text-3xl font-bold">{formData.name}</h1>
              <div className="flex items-center justify-start gap-2 mt-1 text-blue-100">
                <Mail size={15} />
                <p className="flex items-center">{formData.email}</p>
              </div>
              {formData.location && (
                <div className="flex items-center gap-1 mt-1 text-blue-100 text-sm">
                  <MapPin size={14} />
                  <p>{formData.location}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 px-4 py-2 rounded-xl h-fit w-fit flex items-center gap-2 text-sm hover:bg-white/30 transition"
          >
            {isEditing ? <X /> : <Edit />}
          </button>
        </div>

        {/* About Me Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              About Me
            </h2>
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition h-28"
                    placeholder="Tell us about yourself, your career goals, and what you're passionate about..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {formData.bio || (
                    <span className="text-gray-400 italic">
                      No bio added yet. Click "Edit Profile" to tell us about
                      yourself.
                    </span>
                  )}
                </p>
                {formData.location && !isEditing && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                    <MapPin size={16} className="text-blue-500" />
                    <span>{formData.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden capitalize">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Code size={20} className="text-green-600" />
              Technical Skills
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div
                    key={skill}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-200 shadow-sm"
                  >
                    <span className="font-medium">{skill}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-600 transition"
                        title="Remove skill"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No skills added yet.</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-4 pt-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add a skill (e.g., React, Python, Data Analysis)..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
                <button
                  onClick={addSkill}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition font-medium"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <GraduationCap size={20} className="text-purple-600" />
              Education
            </h2>
          </div>
          <div className="p-6">
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-start justify-between hover:shadow-sm transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900">
                        {edu.degree} in {edu.field}
                      </p>
                      {(edu.startYear || edu.endYear) && (
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar size={14} className="text-purple-500" />
                          <p className="text-sm text-purple-600">
                            {edu.startYear || "?"} - {edu.endYear || "Present"}
                          </p>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => deleteEducationEntry(idx)}
                        className="text-red-400 hover:text-red-600 transition p-1"
                        title="Delete education"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic mb-4">
                No education added yet.
              </p>
            )}

            {isEditing && (
              <div className="mt-6 bg-gray-50 p-5 rounded-xl border-2 border-dashed border-purple-200">
                <p className="text-sm font-medium text-purple-600 mb-3 flex items-center gap-2">
                  <Plus size={18} />
                  Add New Education
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        degree: e.target.value,
                      })
                    }
                    placeholder="Degree (e.g., Bachelor's, Master's)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={newEducation.field}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        field: e.target.value,
                      })
                    }
                    placeholder="Field of Study"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={newEducation.startYear}
                      onChange={(e) =>
                        setNewEducation({
                          ...newEducation,
                          startYear: e.target.value,
                        })
                      }
                      placeholder="Start Year"
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      value={newEducation.endYear}
                      onChange={(e) =>
                        setNewEducation({
                          ...newEducation,
                          endYear: e.target.value,
                        })
                      }
                      placeholder="End Year"
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={addEducationEntry}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    <Plus size={18} /> Add Education
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase size={20} className="text-orange-600" />
              Work Experience
            </h2>
          </div>
          <div className="p-6">
            {experience.length > 0 ? (
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex items-start justify-between hover:shadow-sm transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900">
                        {exp.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={14} className="text-orange-500" />
                        <p className="text-sm text-orange-600">
                          {exp.duration || "Duration not specified"}
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => deleteExperienceEntry(idx)}
                        className="text-red-400 hover:text-red-600 transition p-1"
                        title="Delete experience"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic mb-4">
                No experience added yet.
              </p>
            )}

            {isEditing && (
              <div className="mt-6 bg-gray-50 p-5 rounded-xl border-2 border-dashed border-orange-200">
                <p className="text-sm font-medium text-orange-600 mb-3 flex items-center gap-2">
                  <Plus size={18} /> Add New Experience
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        title: e.target.value,
                      })
                    }
                    placeholder="Job Title (e.g., Software Engineer Intern)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    value={newExperience.duration}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        duration: e.target.value,
                      })
                    }
                    placeholder="Duration (e.g., June 2023 - Aug 2024)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={addExperienceEntry}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium"
                  >
                    <Plus size={18} /> Add Experience
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resume Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText size={22} className="text-blue-600" />
              Resume
            </h2>
          </div>
          <div className="p-6">
            {user?.profile?.resume?.fileUrl ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.profile.resume.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded:{" "}
                        {user.profile.resume.uploadedAt
                          ? new Date(
                              user.profile.resume.uploadedAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:8000${user.profile.resume.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View Resume →
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center mb-4">
                <FileText size={40} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No resume uploaded yet</p>
              </div>
            )}

            <label className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">
              {resumeLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  {user?.profile?.resume?.fileUrl
                    ? "Upload New Resume"
                    : "Upload Resume"}
                </>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
                disabled={resumeLoading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </div>

        {/* Edit Mode  */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm ">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-start gap-4">
                <button
                  onClick={handleUpdateProfile}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  <Save size={18} />
                  Save Changes
                </button>

                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentProfile;
