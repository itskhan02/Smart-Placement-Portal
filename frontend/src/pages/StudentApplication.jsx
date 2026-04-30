import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Building2,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  X,
  DollarSign,
  Award,
  Mail,
  Trash2,
} from "lucide-react";
import Layout from "../components/Layout";
import api from "../utils/api";
import toast from "react-hot-toast";

const StudentApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [reportCategory, setReportCategory] = useState("fake_job");
  const [reportDescription, setReportDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/application/applied-jobs");
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportCategory) {
      return toast.error("Please select a reason");
    }

    try {
      setSubmitting(true);
      await api.post("/report", {
        reportedUserId: selectedUser,
        category: reportCategory,
        description: reportDescription || "Reported from applications page",
        source: "profile",
      });

      toast.success("Report submitted successfully");
      setShowReportModal(false);
      setReportCategory("fake_job");
      setReportDescription("");
      setSelectedUser(null);
      setSelectedUserName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const openReportModal = (recruiter) => {
    setSelectedUser(recruiter._id);
    setSelectedUserName(recruiter.name);
    setShowReportModal(true);
  };

  const handleRemoveDeletedJobApplication = async (applicationId) => {
    const confirmed = window.confirm(
      "Remove this deleted job application from your applications?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(applicationId);
      await api.delete(`/application/deleted-job/${applicationId}`);
      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
      toast.success("Deleted job application removed");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to remove application",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: CheckCircle,
          label: "Accepted",
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: XCircle,
          label: "Rejected",
        };
      case "reviewing":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: Eye,
          label: "Under Review",
        };
      default:
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: Clock,
          label: "Pending",
        };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    return salary;
  };

  const DeletedJobNotice = () => (
    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-700">
          This job was deleted by the recruiter
        </p>
        <p className="text-sm text-red-600 mt-1">
          The job details are no longer available, but your application record
          is still shown here.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout role="student">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <div className="w-full space-y-6 relative">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Applications
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track and manage all your job applications in one place
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              Total: {applications.length}{" "}
              {applications.length === 1 ? "Application" : "Applications"}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              You haven't applied to any jobs. Start exploring opportunities!
            </p>
            <button
              onClick={() => navigate("/student/jobs")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Browse Jobs
            </button>
          </div>
        )}

        {/* applications list  */}
        {!loading && applications.length > 0 && (
          <div className="space-y-5">
            {applications.map((app) => {
              const statusStyle = getStatusStyle(app.status);
              const StatusIcon = statusStyle.icon;
              const isJobDeleted = !app.job;

              return (
                <div
                  key={app._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div
                    className={`px-6 py-3 border-b ${statusStyle.border} ${statusStyle.bg}`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon size={18} className={statusStyle.text} />
                        <span
                          className={`text-sm font-semibold ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Applied on {formatDate(app.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        {/* job title & company */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {app.job?.title || "Job deleted by recruiter"}
                          </h3>
                          {app.job?.company?.name && (
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-gray-400" />
                              <span className="text-gray-700 font-medium">
                                {app.job.company.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {isJobDeleted ? (
                          <DeletedJobNotice />
                        ) : (
                          <>
                            {/* job details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin
                                  size={16}
                                  className="text-green-600 flex-shrink-0"
                                />
                                <span>{app.job.location || "Remote"}</span>
                              </div>
                              {app.job.salary && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <DollarSign
                                    size={16}
                                    className="text-green-600 flex-shrink-0"
                                  />
                                  <span>{formatSalary(app.job.salary)}</span>
                                </div>
                              )}
                              {app.job.jobType && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Briefcase
                                    size={16}
                                    className="text-blue-600 flex-shrink-0"
                                  />
                                  <span className="capitalize">
                                    {app.job.jobType.replace("-", " ")}
                                  </span>
                                </div>
                              )}
                              {app.job.experience && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Award
                                    size={16}
                                    className="text-purple-600 flex-shrink-0"
                                  />
                                  <span>Experience: {app.job.experience}</span>
                                </div>
                              )}
                            </div>

                            {/* skills  */}
                            {app.job.skillsrequired &&
                              app.job.skillsrequired.length > 0 && (
                                <div className="pt-2">
                                  <p className="text-xs font-medium text-gray-500 mb-2">
                                    SKILLS REQUIRED
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {app.job.skillsrequired
                                      .slice(0, 6)
                                      .map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    {app.job.skillsrequired.length > 6 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                                        +{app.job.skillsrequired.length - 6}{" "}
                                        more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Job Description Preview */}
                            {app.job.description && (
                              <div className="pt-2">
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                  JOB DESCRIPTION
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                  {app.job.description}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">

                        {app.recruiter && (
                          <div className="mb-5">
                            <p className="text-xs font-medium text-gray-500 mb-3">
                              RECRUITER INFORMATION
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <p className="font-medium text-gray-900">
                                {app.recruiter.name}
                              </p>
                              {app.recruiter.email && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Mail size={12} />
                                  <span>{app.recruiter.email}</span>
                                </div>
                              )}
                              {app.recruiter.profile?.designation && (
                                <p className="text-xs text-gray-600">
                                  {app.recruiter.profile.designation}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <p className="text-xs font-medium text-gray-500">
                            ACTIONS
                          </p>
                          <div className="flex flex-col gap-2">
                            {isJobDeleted ? (
                              <>
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                                  <AlertTriangle size={16} />
                                  Job details unavailable
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDeletedJobApplication(app._id)
                                  }
                                  disabled={deletingId === app._id}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium border border-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={16} />
                                  {deletingId === app._id
                                    ? "Removing..."
                                    : "Remove Deleted Job"}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  navigate(`/student/job/${app.job._id}`)
                                }
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                <Eye size={16} />
                                View Full Job Details
                              </button>
                            )}

                            {app.canMessage && app.recruiter?._id && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/student/messages?user=${app.recruiter._id}`,
                                    )
                                  }
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium border border-indigo-200"
                                >
                                  <MessageCircle size={16} />
                                  Send Message to Recruiter
                                </button>

                                <button
                                  onClick={() => openReportModal(app.recruiter)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium border border-red-200"
                                >
                                  <AlertTriangle size={16} />
                                  Report Recruiter
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* report popup */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 absolute">
          <div className="bg-white rounded-xl w-[500px] max-w-[90vw] shadow-xl fixed ">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Report Recruiter
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Help us maintain a safe community
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5 ">

              {selectedUserName && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">REPORTING:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                      {selectedUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedUserName}
                      </p>
                      <p className="text-xs text-gray-500">Recruiter</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Report <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                >
                  <option value="spam">Spam / Unsolicited Messages</option>
                  <option value="abuse">Abuse / Offensive Behavior</option>
                  <option value="fake_job">Fake Job Posting</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                  <span className="text-gray-400 text-xs ml-2">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Please provide any additional information that might help us investigate this report..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  False reports may lead to action against your account.
                  Please only report genuine violations.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentApplication;
