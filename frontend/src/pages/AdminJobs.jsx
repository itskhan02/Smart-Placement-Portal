import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Trash2,
  AlertTriangle,
  Eye,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/jobs");
      const jobsData = res.data.jobs || [];
      setJobs(jobsData);

      // Calculate stats
      const active = jobsData.filter((job) => job.is_active !== false).length;
      const inactive = jobsData.filter((job) => job.is_active === false).length;
      setStats({
        total: jobsData.length,
        active,
        inactive,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    try {
      setDeletingId(selectedJob._id);
      await api.delete(`/admin/jobs/${selectedJob._id}`);
      setJobs((prev) => prev.filter((job) => job._id !== selectedJob._id));
      toast.success("Job deleted successfully");
      setShowDeleteModal(false);
      setSelectedJob(null);

      // Update stats
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        active: selectedJob.is_active !== false ? prev.active - 1 : prev.active,
        inactive:
          selectedJob.is_active === false ? prev.inactive - 1 : prev.inactive,
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "full-time":
        return "bg-purple-100 text-purple-700";
      case "remote":
        return "bg-green-100 text-green-700";
      case "internship":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              View and manage all job postings on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchJobs}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <Briefcase size={20} className="text-blue-700" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Active Jobs
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.active}
                </p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Eye size={20} className="text-green-700" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Inactive Jobs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
              <div className="p-2 bg-gray-200 rounded-lg">
                <Clock size={20} className="text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 text-sm">
              There are no job postings on the platform yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left Section - Job Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {job.title}
                          </h3>
                          {job.is_active !== false ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              Inactive
                            </span>
                          )}
                          {job.jobType && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getJobTypeColor(job.jobType)}`}
                            >
                              {job.jobType.replace("-", " ")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 size={14} className="text-gray-400" />
                          <span>
                            {job.createdBy?.name ||
                              job.company?.name ||
                              "Unknown Company"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin size={14} className="text-green-600" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <DollarSign size={14} className="text-green-600" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.application && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Users size={14} className="text-blue-600" />
                            <span>{job.application.length} applications</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar size={14} className="text-gray-400" />
                          <span>Posted: {formatDate(job.createdAt)}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skillsrequired && job.skillsrequired.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1 capitalize">
                          {job.skillsrequired.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skillsrequired.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                              +{job.skillsrequired.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDeleteModal(job)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium border border-red-200"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] max-w-[90vw] shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete Job
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are about to delete:
                </p>
                <p className="font-semibold text-gray-900">
                  {selectedJob.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedJob.createdBy?.name || selectedJob.company?.name}
                </p>
              </div>
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle size={16} />
                This will permanently remove this job and all associated
                applications.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId === selectedJob._id}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === selectedJob._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Job
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

export default AdminJobs;
