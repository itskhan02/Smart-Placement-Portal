import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Edit, Save, X, Camera, MapPin, Calendar, Globe, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const RecruiterProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    email: "",
    designation: "",
    location: "",
    experienceYears: "",
    skills: "",
    linkedin: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/users/profile");
      const u = res.data.user;

      setUser(u);

      setForm({
        name: u.name || "",
        bio: u.profile?.bio || "",
        email: u.email || "",
        designation: u.profile?.designation || "",
        location: u.profile?.location || "",
        experienceYears: u.profile?.experienceYears || "",
        skills: (u.profile?.skills || []).join(", "),
        linkedin: u.profile?.linkedin || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/users/profile/update", {
        ...form,
        experienceYears: Number(form.experienceYears),
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });

      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailUpdate = async () => {
  try {
    setSaving(true);
    setError(null);

    await api.post("/users/email/send-otp");

    setShowOtpModal(true);

  } catch (err) {
    setError("Failed to send OTP");
  } finally {
    setSaving(false);
  }
};

const handleVerifyOtp = async () => {
  try {
    setSaving(true);

    const res = await api.post("/users/email/verify-otp", {
      otp,
      newEmail: form.email,
    });

    setUser(res.data.user);
    setShowOtpModal(false);
    setOtp("");

  } catch (err) {
    setError(err.response?.data?.error || "Verification failed");
  } finally {
    setSaving(false);
  }
};

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.put("/users/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.user);
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  if (loading) {
    return (
      <Layout role="recruiter">
        <p className="text-center py-10">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout role="recruiter">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>
        )}

        {/* 🔹 HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-xl text-white flex justify-between">
          <div className="flex gap-5 items-center">
            <div className="relative">
              {user.profile?.profilePicture ? (
                <img
                  src={`http://localhost:8000${user.profile.profilePicture}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  alt={user.name}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {user.name && user.name.length > 0
                    ? user.name[0].toUpperCase()
                    : "U"}
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 cursor-pointer">
                <Camera size={16} />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />
              </label>
            </div>

            <div>
              <h2 className="text-2xl font-bold ">{user.name}</h2>

              <p>
                {user.profile?.designation || "Recruiter"} @{" "}
                {user.profile?.company?.name || "No Company"}
              </p>

              <p className="flex items-center gap-1 text-sm">
                <MapPin size={14} />
                {user.profile?.location || "Location not set"}
              </p>

              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 px-4 py-2 rounded-xl h-fit w-fit flex items-center gap-2 text-sm hover:bg-white/30 transition"
          >
            {isEditing ? <X /> : <Edit />}
          </button>
        </div>

        {/* about */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">About</h3>

          {isEditing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border p-2"
            />
          ) : (
            <p>{user.profile?.bio || "No bio added"}</p>
          )}
        </div>

        {/* company */}
        {!user.profile?.company && (
          <div className="flex justify-end ">
            <Link
              to="/recruiter/create-company"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              <button
                onClick={() => navigate("/company/create")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                Create Company
              </button>
            </Link>
          </div>
        )}

        {user.profile?.company && (
          <div className="bg-white p-6 rounded shadow flex flex-col width-full">
            <h3 className="font-semibold mb-2">Company</h3>

            <div className="flex items-center gap-4">
              {user.profile.company.logo && (
                <img
                  src={`http://localhost:8000${user.profile.company.logo}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}

              <div>
                <p className="text-lg font-bold">{user.profile.company.name}</p>

                {user.profile?.industry && (
                  <span
                    style={{
                      backgroundColor: "#E0F2FE",
                      color: "#0369A1",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {user.profile.industry}
                  </span>
                )}

                {user.profile.company.website && (
                  <p className="text-blue-600 text-sm">
                    {user.profile.company.website}
                  </p>
                )}

                {user.profile.company.location && (
                  <p className="text-gray-500 text-sm">
                    {user.profile.company.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* skills */}
        <div className="bg-white p-6 rounded shadow capitalize">
          <h3 className="font-semibold mb-2">Skills</h3>

          <div className="flex flex-wrap gap-2">
            {(user.profile?.skills || []).map((s, i) => (
              <span key={i} className="bg-blue-100 px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* experience */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-2">Experience</h3>
            <p>{user.profile?.experienceYears || 0} years</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-2">Links</h3>
            {user.profile?.linkedin ? (
              <a
                href={user.profile.linkedin}
                target="_blank"
                className="text-blue-600"
              >
                LinkedIn Profile
              </a>
            ) : (
              <p>No link added</p>
            )}
          </div>
        </div>

        {/* edit section */}
        {isEditing && (
          <div className="bg-white p-6 rounded-lg shadow border space-y-4">
            <h3 className="font-semibold text-lg mb-4">Edit Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <button
                  onClick={handleEmailUpdate}
                  disabled={saving || form.email === user.email}
                  style={{
                    marginTop: "22px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    opacity: form.email === user.email ? 0.6 : 1,
                  }}
                >
                  Update
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g., HR Manager, Talent Acquisition Lead"
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  value={form.experienceYears}
                  onChange={(e) =>
                    setForm({ ...form, experienceYears: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g., Technology, Healthcare"
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div> */}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g., Recruitment, Interviewing, HR Management"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={form.linkedin}
                  onChange={(e) =>
                    setForm({ ...form, linkedin: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {showOtpModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "320px",
            }}
          >
            <h3 style={{ fontWeight: "bold" }}>Verify OTP</h3>

            <p style={{ fontSize: "12px", color: "gray" }}>
              OTP sent to your current email
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={handleVerifyOtp}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "10px",
                  borderRadius: "6px",
                  flex: 1,
                }}
              >
                Verify
              </button>

              <button
                onClick={() => setShowOtpModal(false)}
                style={{
                  background: "#6b7280",
                  color: "white",
                  padding: "10px",
                  borderRadius: "6px",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RecruiterProfile;
