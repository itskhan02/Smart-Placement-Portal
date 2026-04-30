import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Mail,
  Phone,
  Calendar,
  Award,
  Activity,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  UserCheck,
  Flag,
  FileText,
  MessageSquare,
} from "lucide-react";
import api from "../utils/api";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchRecentActivity();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/profile");
      setUser(res.data.user);
      setFormData({
        name: res.data.user.name,
        email: res.data.user.email,
        bio: res.data.user.profile?.bio || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put("/users/profile/update", {
        name: formData.name,
        bio: formData.bio,
      });
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await api.put("/users/profile/picture", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await api.get("/admin/recent-activity");
      setRecentActivity(res.data.activities || []);
    } catch (err) {
      console.error("Failed to load recent activity:", err);
    }
  };

  if (loading)
    return (
      <Layout role="admin">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );

  return (
    <>
      <Layout role="admin">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.profile?.profilePicture ? (
                    <img
                      src={`http://localhost:8000${user.profile.profilePicture}`}
                      alt={user.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                      <Shield size={48} />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white text-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-50 transition shadow-md">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{formData.name}</h1>
                    <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-400/30">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-purple-100 mt-2 text-lg">
                    Administrator
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-purple-100 text-sm">
                      <Mail size={14} />
                      {formData.email}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg transition font-medium"
              >
                {isEditing ? <X size={20} /> : <Edit size={20} />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* main info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                  About
                </h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 h-32 text-justify"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {formData.bio ||
                        "No bio added yet. Click edit to add your bio."}
                    </p>
                  </div>
                )}
              </div>

              {/* recent activity */}
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <Activity size={20} className="text-blue-600" />
                  Recent Activity
                </h2>
                <div className="space-y-2">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity, index) => {
                      let Icon = Activity;
                      let iconColor = "text-gray-600";
                      let bgColor = "bg-gray-50";
                      let borderColor = "border-gray-100";

                      switch (activity.type) {
                        case "registration":
                          Icon = UserCheck;
                          iconColor = "text-green-600";
                          bgColor = "bg-green-50";
                          borderColor = "border-green-100";
                          break;
                        case "report":
                          Icon = Flag;
                          iconColor = "text-red-600";
                          bgColor = "bg-red-50";
                          borderColor = "border-red-100";
                          break;
                        case "application":
                          Icon = FileText;
                          iconColor = "text-blue-600";
                          bgColor = "bg-blue-50";
                          borderColor = "border-blue-100";
                          break;
                        case "message":
                          Icon = MessageSquare;
                          iconColor = "text-purple-600";
                          bgColor = "bg-purple-50";
                          borderColor = "border-purple-100";
                          break;
                      }

                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-xl border ${bgColor} ${borderColor} transition-all hover:shadow-sm`}
                        >
                          <div className={`p-2 rounded-lg bg-white shadow-sm border ${borderColor}`}>
                            <Icon size={16} className={iconColor} />
                          </div>
                          <div className="flex-1 min-w-0 mt-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              {activity.description}
                            </p>
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 flex-shrink-0 mt-0.5">
                            {activity.time}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No recent activity available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* account info */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Account Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="text-sm font-medium text-purple-600">
                      Administrator
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm text-gray-700">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* permissions */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield size={18} /> Admin Permissions
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    "Manage Users",
                    "Manage Companies",
                    "View Analytics",
                    "System Settings",
                    "Monitor Jobs",
                    "View Reports",
                    "Company Approvals",
                    "Send Warnings",
                  ].map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg transition"
                    >
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-sm text-gray-700">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AdminProfile;
