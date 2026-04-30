import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  FileText,
  Eye,
  TrendingUp,
  ChevronRight,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [companyLogoErrors, setCompanyLogoErrors] = useState({});
  const [applyingId, setApplyingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/student/dashboard");
      console.log("Dashboard data:", res.data);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoError = (jobId) => {
    setCompanyLogoErrors((prev) => ({ ...prev, [jobId]: true }));
  };

  const getCompanyLogoUrl = (company) => {
    if (!company?.logo) return null;
    const logo = company.logo;
    if (logo.startsWith("http")) return logo;
    if (logo.startsWith("/uploads")) return `http://localhost:8000${logo}`;
    return `http://localhost:8000/uploads/company/${logo}`;
  };

  const getCompanyName = (company) => {
    if (!company) return "Company";
    if (typeof company === "string") return company;
    return company.name || "Company";
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    const numSalary = parseInt(salary);
    if (!isNaN(numSalary)) {
      if (numSalary >= 100000) {
        return `₹${(numSalary / 100000).toFixed(1)}L`;
      }
      if (numSalary >= 1000) {
        return `₹${(numSalary / 1000).toFixed(0)}K`;
      }
    }
    return `₹${salary}`;
  };

  if (!data) {
    return (
      <Layout role="student">
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
        </div>
      </Layout>
    );
  }

  const { user, stats, jobs, applications } = data;

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "bg-green-100 text-green-700";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

 

  const handleApply = async (e, jobId) => {
    e.stopPropagation();

    try {
      setApplyingId(jobId);

      await api.post(`/application/apply/${jobId}`);

      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          jobs: (prev.jobs || []).map((job) =>
            job._id === jobId ? { ...job, applied: true } : job,
          ),
          stats: {
            ...prev.stats,
            applications: (prev.stats?.applications || 0) + 1,
          },
        };
      });

      toast.success("Application submitted successfully");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to apply";
      toast.error(msg);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <Layout role="student">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, <span className="text-blue-600">{user.name}</span>
            </h1>
            <p className="text-gray-600 mt-1 font-normal">Here's your placement overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <StatCard
            title="Resume Score"
            value={stats.resumeScore}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Job Matches"
            value={stats.jobMatches}
            icon={Briefcase}
            color="green"
          />
          <StatCard
            title="Applications"
            value={stats.applications}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Profile Views"
            value={stats.views}
            icon={Eye}
            color="orange"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  Resume Score
                </h3>
                <Award size={20} className="text-blue-500" />
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={getScoreColor(stats.resumeScore)}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${stats.resumeScore * 2.76} 276`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {stats.resumeScore}
                    </span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      stats.resumeScore >= 80
                        ? "bg-green-100 text-green-700"
                        : stats.resumeScore >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stats.resumeScore >= 80
                      ? "Excellent"
                      : stats.resumeScore >= 60
                        ? "Good"
                        : "Needs Improvement"}
                  </span>
                </div>

                {/* suggestions */}
                <div className="mt-6 w-full">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Suggestions to Improve
                  </h4>
                  <div className="space-y-2">
                    {stats.suggestions?.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Button
                <button
                  onClick={() => navigate("/student/resume")}
                  className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors"
                >
                  <Upload size="18" className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Upload New Resume
                  </span>
                </button> */}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-lg text-gray-900">
                  Top Job Matches
                </h3>
                <button
                  onClick={() => navigate("/student/jobs")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ChevronRight size="16" />
                </button>
              </div>

              <div className="space-y-4">
                {jobs?.slice(0, 3).map((job) => {
                  const companyName = getCompanyName(job.company);
                  const companyLogoUrl = getCompanyLogoUrl(job.company);
                  const showLogoError = companyLogoErrors[job._id];
                  const skills = job.skills || job.skillsrequired || [];
                  const displaySkills = skills.slice(0, 4);

                  return (
                    <div
                      key={job._id}
                      onClick={() => navigate(`/student/job/${job._id}`)}
                      className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* job title and company */}
                          <div className="flex items-center gap-3 mb-2">
                            {companyLogoUrl && !showLogoError ? (
                              <img
                                src={companyLogoUrl}
                                alt={companyName}
                                onError={() => handleLogoError(job._id)}
                                className="w-10 h-10 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {companyName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {job.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {companyName}
                              </p>
                            </div>
                          </div>

                          {/* location and salary */}
                          <p className="text-xs text-gray-500 mb-2">
                            {job.location || "Remote"} •{" "}
                            {formatSalary(job.salary)}
                          </p>

                          {/* skills */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {displaySkills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 4 && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                +{skills.length - 4}
                              </span>
                            )}
                          </div>

                          {/* posted date */}
                          {job.posted && (
                            <p className="text-xs text-gray-400">
                              {job.posted}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3 ml-4">
                          {/* match percentage */}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.match)}`}
                          >
                            {job.match}% Match
                          </span>

                          {/* apply button */}
                          <div className="pt-4 border-t flex justify-end">
                            <button
                              onClick={(e) => handleApply(e, job._id)}
                              disabled={job.applied || applyingId === job._id}
                              className={`px-4 py-2 rounded-lg text-white ${
                                job.applied
                                  ? "bg-green-500  font-semibold cursor-not-allowed"
                                  : "bg-blue-600 font-semibold hover:bg-blue-200 hover:text-blue-800 active:scale-95 transition-all duration-200"
                              }`}
                            >
                              {job.applied
                                ? "Applied"
                                : applyingId === job._id
                                  ? "Applying..."
                                  : "Click to Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!jobs || jobs.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No job matches found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RECENT APPLICATIONS TABLE */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-lg text-gray-900">
              Recent Applications
            </h3>
            <button
              onClick={() => navigate("/student/application")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight size="16" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-3 font-medium">Company</th>
                  <th className="text-left py-3 font-medium">Position</th>
                  <th className="text-center py-3 font-medium">Match</th>
                  <th className="text-center py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications?.map((app) => (
                  <tr
                    key={app._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 font-medium text-gray-900">
                      {app.company}
                    </td>
                    <td className="py-3 text-gray-600">{app.position}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(app.match)}`}
                      >
                        {app.match}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          app.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : app.status === "reviewing"
                              ? "bg-yellow-100 text-yellow-700"
                              : app.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{app.date}</td>
                  </tr>
                ))}

                {(!applications || applications.length === 0) && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No applications yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};


export default StudentDashboard;
