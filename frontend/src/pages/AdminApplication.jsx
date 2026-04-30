import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import {
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Mail,
  Building2,
  AlertCircle,
  Trash2,
  X,
  Ban,
  User,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminApplication = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Remove confirmation popup state
  const [removePopup, setRemovePopup] = useState({
    isOpen: false,
    applicationId: null,
    studentName: "",
    jobTitle: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/applications");
      const applications = res.data.applications || [];
      setApps(applications);

      // Calculate stats
      const pending = applications.filter(
        (app) => app.status === "pending",
      ).length;
      const reviewing = applications.filter(
        (app) => app.status === "reviewing",
      ).length;
      const accepted = applications.filter(
        (app) => app.status === "accepted",
      ).length;
      const rejected = applications.filter(
        (app) => app.status === "rejected",
      ).length;

      setStats({
        total: applications.length,
        pending,
        reviewing,
        accepted,
        rejected,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
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
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getJobTitle = (job) => job?.title || "Job deleted by recruiter";

  const removeApplicationFromState = (applicationId) => {
    setApps((prevApps) => {
      const removedApp = prevApps.find((app) => app._id === applicationId);
      const nextApps = prevApps.filter((app) => app._id !== applicationId);

      if (removedApp) {
        setStats((prevStats) => ({
          total: Math.max(prevStats.total - 1, 0),
          pending:
            removedApp.status === "pending"
              ? Math.max(prevStats.pending - 1, 0)
              : prevStats.pending,
          reviewing:
            removedApp.status === "reviewing"
              ? Math.max(prevStats.reviewing - 1, 0)
              : prevStats.reviewing,
          accepted:
            removedApp.status === "accepted"
              ? Math.max(prevStats.accepted - 1, 0)
              : prevStats.accepted,
          rejected:
            removedApp.status === "rejected"
              ? Math.max(prevStats.rejected - 1, 0)
              : prevStats.rejected,
        }));
      }

      return nextApps;
    });
  };

  const handleRemoveClick = (application) => {
    setRemovePopup({
      isOpen: true,
      applicationId: application._id,
      studentName: application.applicant?.name || "Unknown Student",
      jobTitle: getJobTitle(application.job),
    });
  };

  const handleConfirmRemove = async () => {
    const { applicationId } = removePopup;
    if (!applicationId) return;

    try {
      setDeletingId(applicationId);
      await api.delete(`/application/deleted-job/${applicationId}`);
      removeApplicationFromState(applicationId);
      toast.success("Application removed successfully");
      setRemovePopup({
        isOpen: false,
        applicationId: null,
        studentName: "",
        jobTitle: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to remove application",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      (app.applicant?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getJobTitle(app.job).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-100 border-t-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-ping"></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400 font-medium">
            Loading applications...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Applications
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track and manage all student job applications
            </p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-xs font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-shadow">
            <p className="text-yellow-600 text-xs font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {stats.pending}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow">
            <p className="text-blue-600 text-xs font-medium">Reviewing</p>
            <p className="text-2xl font-bold text-blue-900">
              {stats.reviewing}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-md transition-shadow">
            <p className="text-green-600 text-xs font-medium">Accepted</p>
            <p className="text-2xl font-bold text-green-900">
              {stats.accepted}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-md transition-shadow">
            <p className="text-red-600 text-xs font-medium">Rejected</p>
            <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by student name, job title, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium bg-gray-50"
              >
                <Filter size={16} />
                Filter by Status
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl ${statusFilter === "all" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("pending");
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${statusFilter === "pending" ? "bg-yellow-50 text-yellow-600 font-medium" : "text-gray-700"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("reviewing");
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${statusFilter === "reviewing" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("accepted");
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${statusFilter === "accepted" ? "bg-green-50 text-green-600 font-medium" : "text-gray-700"}`}
                  >
                    Accepted
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("rejected");
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 rounded-b-xl ${statusFilter === "rejected" ? "bg-red-50 text-red-600 font-medium" : "text-gray-700"}`}
                  >
                    Rejected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredApps.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">{apps.length}</span>{" "}
            applications
          </p>
          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No applications have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              const isJobDeleted = !app.job;

              return (
                <div
                  key={app._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left Section - Application Details */}
                      <div className="flex-1 space-y-3">
                        {/* Student Info */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
                            {app.applicant?.name?.charAt(0).toUpperCase() ||
                              "S"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {app.applicant?.name || "Unknown Student"}
                            </h3>
                            {app.applicant?.email && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Mail size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {app.applicant.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Job Info */}
                        <div className="pl-14">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Briefcase size={14} className="text-gray-400" />
                            <span className="font-medium">Applied for:</span>
                            <span
                              className={
                                isJobDeleted ? "text-red-600 font-medium" : ""
                              }
                            >
                              {getJobTitle(app.job)}
                            </span>
                          </div>

                          {isJobDeleted && (
                            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                              <AlertCircle
                                size={14}
                                className="mt-0.5 flex-shrink-0"
                              />
                              <span>
                                The recruiter deleted this job, so the job
                                details are no longer available.
                              </span>
                            </div>
                          )}

                          {app.job?.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Building2 size={14} className="text-gray-400" />
                              <span>
                                {typeof app.job.company === "object"
                                  ? app.job.company.name
                                  : app.job.company}
                              </span>
                            </div>
                          )}

                          {app.createdAt && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                              <Calendar size={12} />
                              <span>
                                Applied on {formatDate(app.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Status */}
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm`}
                        >
                          <StatusIcon size={14} />
                          <span className="text-sm font-medium capitalize">
                            {statusConfig.label}
                          </span>
                        </div>
                        {isJobDeleted && (
                          <button
                            type="button"
                            onClick={() => handleRemoveClick(app)}
                            disabled={deletingId === app._id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {deletingId === app._id ? (
                              <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-red-600 border-t-transparent"></div>
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Remove Application
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Remove Confirmation Popup */}
      {removePopup.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[450px] max-w-[90vw] shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Remove Application
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setRemovePopup({
                    isOpen: false,
                    applicationId: null,
                    studentName: "",
                    jobTitle: "",
                  })
                }
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {/* Warning Message */}
              <div className="mb-5 p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-start gap-3">
                  <Ban
                    size={20}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-red-700 text-sm">
                      Permanent Removal
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      This application will be permanently removed from the
                      system. The student's application data will be deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Info */}
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      Application to be removed
                    </p>
                    <p className="font-semibold text-gray-900 text-base mt-0.5">
                      {removePopup.studentName}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Briefcase size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {removePopup.jobTitle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() =>
                  setRemovePopup({
                    isOpen: false,
                    applicationId: null,
                    studentName: "",
                    jobTitle: "",
                  })
                }
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={deletingId === removePopup.applicationId}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === removePopup.applicationId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm Removal
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

export default AdminApplication;
