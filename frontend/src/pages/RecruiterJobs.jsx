import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Plus,
  Briefcase,
  MapPin,
  Users,
  Trash2,
  ToggleRight,
  ToggleLeft,
  X,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { motion } from "framer-motion";

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation popup state
  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: "",
    companyName: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/getall");
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job) => {
    setDeletePopup({
      isOpen: true,
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.company?.name || "Unknown Company",
    });
  };

  const handleConfirmDelete = async () => {
    const { jobId } = deletePopup;
    if (!jobId) return;

    try {
      await api.delete(`/jobs/delete/${jobId}`);
      setJobs(jobs.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
      setDeletePopup({
        isOpen: false,
        jobId: null,
        jobTitle: "",
        companyName: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.put(`/jobs/toggle/${id}`);
      setJobs((prev) =>
        prev.map((job) =>
          job._id === id ? { ...job, is_active: !job.is_active } : job,
        ),
      );
      toast.success("Job status updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <Layout role="recruiter">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Job Postings
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Manage all your job listings
              </p>
            </div>
            <Link to="/recruiter/post-job">
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#08c7f7] to-[#0284c7] text-white font-semibold text-sm px-4 h-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#08c7f7]/50">
                <Plus className="h-4 w-4" />
                Post New Job
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08c7f7] mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500">No jobs posted yet.</p>

              <Link to="/recruiter/post-job">
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#08c7f7] to-[#0284c7] text-white font-semibold text-sm px-4 h-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#08c7f7]/50 mt-4">
                  <Plus className="h-4 w-4" />
                  Post Your First Job
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {jobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border p-5 bg-white hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold capitalize text-lg text-gray-800">
                          {job.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            job.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5">
                        {job.company?.name}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1 capitalize">
                          <MapPin size={14} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {job.application?.length || 0}{" "}
                          Applications
                        </span>
                        <span className="text-base capitalize text-blue-600 font-medium">
                          {job.jobType}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skillsrequired?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 border border-blue-100 transition"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(job._id)}
                        className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                          job.is_active
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                        title={job.is_active ? "Deactivate" : "Activate"}
                      >
                        {job.is_active ? (
                          <ToggleRight className="h-7 w-7" />
                        ) : (
                          <ToggleLeft className="h-7 w-7" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(job)}
                        className="flex items-center justify-center h-10 w-10 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Delete Job"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Layout>

      {/* Delete Confirmation Popup */}
      {deletePopup.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[450px] max-w-[90vw] shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Delete Job Posting
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDeletePopup({
                    isOpen: false,
                    jobId: null,
                    jobTitle: "",
                    companyName: "",
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
                      Permanent Deletion
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      This job posting will be permanently removed. All
                      applications submitted for this job will also be deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Job to be deleted</p>
                    <p className="font-semibold text-gray-900 text-base mt-0.5">
                      {deletePopup.jobTitle}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {deletePopup.companyName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-600 font-bold">"DELETE"</span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  placeholder="Enter DELETE"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  id="confirmDeleteInput"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value === "DELETE") {
                      handleConfirmDelete();
                    }
                  }}
                />
                <p className="text-xs text-gray-400 mt-2">
                  This helps prevent accidental deletion
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() =>
                  setDeletePopup({
                    isOpen: false,
                    jobId: null,
                    jobTitle: "",
                    companyName: "",
                  })
                }
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                id="confirmDeleteBtn"
              >
                <Trash2 size={16} />
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruiterJobs;
