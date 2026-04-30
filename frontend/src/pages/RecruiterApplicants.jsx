import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../components/Layout";
import api from "../utils/api";
import {
  MessageCircle,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";

const RecruiterApplicants = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await api.get("/application/recruiter/all");
      setApps(res.data.applications || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await api.put(`/application/status/${id}/update`, { status });
      await fetchApplicants();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "reviewing":
        return <Eye size={14} />;
      case "accepted":
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout role="recruiter">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applicants...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="recruiter">
      <div className="space-y-6">
        <div className="flex justify-between items-center px-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
            <p className="text-gray-600 text-lg mt-2">
              Review and manage applicants
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-2">
            <p className="text-gray-700 font-semibold mt-1">
              {apps.length} {apps.length === 1 ? "Applicant" : "Applicants"}{" "}
              found
            </p>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserCheck size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applicants yet
            </h3>
            <p className="text-gray-500">
              When students apply to your jobs, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {apps.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-xl text-gray-900">
                            {app.applicant?.name || "Unknown Applicant"}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {app.applicant?.email || "No email provided"}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="md:hidden">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              app.status,
                            )}`}
                          >
                            {getStatusIcon(app.status)}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3">
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                          <span className="text-xs text-gray-500">
                            Applied for
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            {app.job?.title || "Unknown Job"}
                          </p>
                        </div>

                        {app.appliedAt && (
                          <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="text-xs text-gray-500">
                              Applied on
                            </span>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT SECTION - Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Desktop Status Badge */}
                      <div className="hidden md:block">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                            app.status,
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap justify-end">
                        {/* Resume Button */}
                        {app.applicant?.profile?.resume?.fileUrl ? (
                          <a
                            href={`http://localhost:8000${app.applicant.profile.resume.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium border border-blue-200"
                          >
                            <FileText size={16} />
                            View Resume
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            <FileText size={16} />
                            No Resume
                          </button>
                        )}

                        {/* Status Dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateStatus(app._id, e.target.value)
                          }
                          disabled={updatingId === app._id}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        {/* Quick Action Buttons */}
                        <button
                          onClick={() => updateStatus(app._id, "accepted")}
                          disabled={
                            updatingId === app._id || app.status === "accepted"
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingId === app._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Accept
                        </button>

                        <button
                          onClick={() => updateStatus(app._id, "rejected")}
                          disabled={
                            updatingId === app._id || app.status === "rejected"
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingId === app._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <UserX size={16} />
                          )}
                          Reject
                        </button>

                        {/* Message Button */}
                        {app.canMessage && app.applicant?._id && (
                          <button
                            onClick={() =>
                              navigate(
                                `/recruiter/messages?user=${app.applicant._id}`,
                              )
                            }
                            className="inline-flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Send Message"
                          >
                            <MessageCircle size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecruiterApplicants;
