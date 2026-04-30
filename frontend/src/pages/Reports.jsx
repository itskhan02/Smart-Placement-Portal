import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Ban,
  Trash2,
  MessageCircleWarning,
  Send,
  X,
  Clock,
  CheckCircle,
  Flag,
  User,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  Info,

} from "lucide-react";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [filter, setFilter] = useState("all");

  // Confirmation popup state
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    reportId: null,
    action: null,
    userName: "",
    actionType: "",
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (reportId, action, userName) => {
    const actionType =
      action === "disable" ? "Disable Account" : "Delete Content ";
    setConfirmationPopup({
      isOpen: true,
      reportId,
      action,
      userName,
      actionType,
    });
  };

  const handleConfirmAction = async () => {
    const { reportId, action } = confirmationPopup;
    if (!reportId || !action) return;

    try {
      setActionLoading(`${reportId}-${action}`);
      await api.post(`/admin/reports/${reportId}/action`, { action });
      toast.success(`User ${action}d successfully`);
      fetchReports();
      setConfirmationPopup({
        isOpen: false,
        reportId: null,
        action: null,
        userName: "",
        actionType: "",
      });
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendWarning = async (userId) => {
    if (!warningMessage.trim()) {
      toast.error("Message is required");
      return;
    }

    try {
      setActionLoading(`warn-${userId}`);
      await api.post("/admin/warn", { userId, message: warningMessage });
      toast.success("Warning sent successfully");
      setWarningMessage("");
      setSelectedUser(null);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error("Failed to send warning");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 text-xs font-medium rounded-full border border-amber-200/60 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
          <Clock size={11} />
          Pending Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200/60 shadow-sm">
        <CheckCircle size={11} />
        Resolved
      </span>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      harassment: "rose",
      spam: "orange",
      fake_job: "purple",
      inappropriate: "pink",
      scam: "red",
    };
    return colors[category] || "gray";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      harassment: "Harassment",
      spam: "Spam",
      fake_job: "Fake Job",
      inappropriate: "Inappropriate",
      scam: "Scam",
    };
    return (
      labels[category] ||
      category?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Other"
    );
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "pending") return report.status === "pending";
    if (filter === "resolved") return report.status === "action_taken";
    return true;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "action_taken").length,
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
            Loading reports...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="max-w-full mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reports Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Review reported content and take appropriate action
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <h2 className="text-base text-blue-600 font-medium mt-0.5">
              Total Reports
            </h2>
            <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl px-4 py-2  border border-amber-200/50 ">
            <p className="text-base text-amber-600 font-medium mt-0.5">
              Pending
            </p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl px-4 py-2  border border-emerald-200/50 ">
            <p className="text-base text-emerald-600 font-medium mt-0.5">
              Resolved Reports
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.resolved}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">

          <div className="flex gap-4 border-gray-100">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === "all"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === "pending"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-50 text-amber-600 hover:bg-amber-100"
              }`}
            >
              Pending
              {stats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[13px] rounded-full bg-white/20">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === "resolved"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No reports found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== "all"
                ? `No ${filter} reports to display`
                : "All clear! No reports to review"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report, index) => {
              const isExpanded = expandedReport === report._id;
              const categoryColor = getCategoryColor(report.category);
              const categoryLabel = getCategoryLabel(report.category);

              return (
                <div
                  key={report._id}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Collapsed View */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedReport(isExpanded ? null : report._id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap flex-1">
                        {getStatusBadge(report.status)}

                        {/* Category Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-${categoryColor}-50 text-${categoryColor}-600 text-xs font-medium rounded-full border border-${categoryColor}-200/50`}
                        >
                          <Flag size={11} />
                          {categoryLabel}
                        </span>

                        {/* Reported User */}
                        <div className="flex items-center gap-2 ml-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            <User size={12} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {report.reportedUser?.name || "Unknown User"}
                          </span>
                          {report.reportedUser?.email && (
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              ({report.reportedUser.email})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={12} />
                          <span className="hidden sm:inline">
                            {new Date(report.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition">
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left Column - Details */}
                        <div className="space-y-4">
                          {/* Reported User Details */}
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-red-100 rounded-lg">
                                <User size={14} className="text-red-500" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-700">
                                Reported User
                              </h3>
                            </div>
                            <div className="ml-8">
                              <p className="text-base font-semibold text-gray-800">
                                {report.reportedUser?.name || "Unknown User"}
                              </p>
                              {report.reportedUser?.email && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Mail size={12} className="text-gray-400" />
                                  <p className="text-xs text-gray-500">
                                    {report.reportedUser.email}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reported By */}
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <Flag size={14} className="text-blue-500" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-700">
                                Reported By
                              </h3>
                            </div>
                            <div className="ml-8">
                              <p className="text-sm font-medium text-gray-700">
                                {report.reportedBy?.name || "Anonymous User"}
                              </p>
                              {report.reportedBy?.email && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {report.reportedBy.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Description & Actions */}
                        <div className="space-y-4">
                          {/* Description */}
                          {report.description && (
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                  <FileText
                                    size={14}
                                    className="text-purple-500"
                                  />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">
                                  Report Description
                                </h3>
                              </div>
                              <div className="ml-8">
                                <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 leading-relaxed">
                                  "{report.description}"
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Report Info */}
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-gray-100 rounded-lg">
                                <Info size={14} className="text-gray-500" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-700">
                                Report Info
                              </h3>
                            </div>
                            <div className="ml-8 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  Report ID:
                                </span>
                                <span className="text-gray-700 font-mono text-xs">
                                  {report._id.slice(-8)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  Submitted:
                                </span>
                                <span className="text-gray-700">
                                  {new Date(report.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {report.status === "pending" && (
                        <div className="mt-5 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(
                                  report._id,
                                  "disable",
                                  report.reportedUser?.name,
                                );
                              }}
                              disabled={
                                actionLoading === `${report._id}-disable`
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 text-amber-700 text-sm font-medium rounded-xl transition-all duration-200 border border-amber-200 shadow-sm hover:shadow disabled:opacity-50"
                            >
                              {actionLoading === `${report._id}-disable` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
                              ) : (
                                <Ban size={15} />
                              )}
                              Disable Account
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(
                                  report._id,
                                  "delete",
                                  report.reportedUser?.name,
                                );
                              }}
                              disabled={
                                actionLoading === `${report._id}-delete`
                              }
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 text-red-600 text-sm font-medium rounded-xl transition-all duration-200 border border-red-200 shadow-sm hover:shadow disabled:opacity-50"
                            >
                              {actionLoading === `${report._id}-delete` ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                              ) : (
                                <Trash2 size={15} />
                              )}
                              Delete Content
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(report);
                                setSelectedUser(report.reportedUser?._id);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-600 text-sm font-medium rounded-xl transition-all duration-200 border border-blue-200 shadow-sm hover:shadow"
                            >
                              <MessageCircleWarning size={15} />
                              Send Warning
                            </button>
                          </div>
                        </div>
                      )}

                      {report.status === "action_taken" && (
                        <div className="mt-5 pt-4 border-t border-gray-100">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                            <CheckCircle
                              size={15}
                              className="text-emerald-600"
                            />
                            <span className="text-sm text-emerald-700 font-medium">
                              Action has been taken on this report
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      {confirmationPopup.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[400px] max-w-[90vw] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-xl ${
                    confirmationPopup.action === "disable"
                      ? "bg-amber-100"
                      : "bg-red-100"
                  }`}
                >
                  {confirmationPopup.action === "disable" ? (
                    <Ban size={24} className="text-amber-600" />
                  ) : (
                    <Trash2 size={24} className="text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Confirm {confirmationPopup.actionType}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Are you sure you want to{" "}
                  <span className="font-semibold">
                    {confirmationPopup.actionType.toLowerCase()}
                  </span>{" "}
                  for user:
                </p>
                <p className="text-base font-semibold text-gray-800 mt-2">
                  {confirmationPopup.userName || "this user"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmationPopup({
                      isOpen: false,
                      reportId: null,
                      action: null,
                      userName: "",
                      actionType: "",
                    })
                  }
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 ${
                    confirmationPopup.action === "disable"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {confirmationPopup.actionType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {selectedUser && selectedReport && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[480px] max-w-[90vw] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                  <MessageCircleWarning size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Send Warning
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Issue an official warning notification
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedReport(null);
                  setWarningMessage("");
                }}
                className="p-1.5 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* User info card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">Recipient</p>
                    <p className="font-semibold text-gray-800">
                      {selectedReport.reportedUser?.name || "Unknown User"}
                    </p>
                    {selectedReport.reportedUser?.email && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {selectedReport.reportedUser.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning message input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Warning Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a detailed warning message explaining the violation and expected behavior..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none bg-gray-50"
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Info size={10} />
                  This message will be sent to the user via email and in-app
                  notification
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedReport(null);
                  setWarningMessage("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendWarning(selectedUser)}
                disabled={
                  actionLoading === `warn-${selectedUser}` ||
                  !warningMessage.trim()
                }
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === `warn-${selectedUser}` ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send size={15} />
                )}
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
