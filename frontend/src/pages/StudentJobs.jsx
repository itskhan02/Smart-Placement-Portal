import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Layout from "../components/Layout";
import api from "../utils/api";
import {  Briefcase, BriefcaseBusiness, IndianRupee, MapPin, Search, Filter, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();

  const getCompanyName = (company) => company?.name || company || "Company";

  const getCompanyLogoUrl = (company) => {
    if (!company?.logo) return null;
    const logo = company.logo;
    if (logo.startsWith("http")) return logo;
    if (logo.startsWith("/uploads")) return `http://localhost:8000${logo}`;
    return `http://localhost:8000/uploads/company/${logo}`;
  };


  useEffect(() => {
    fetchJobs();
  }, [searchQuery, locationFilter, jobTypeFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (locationFilter) params.append('location', locationFilter);
      if (jobTypeFilter) params.append('jobType', jobTypeFilter);
      if (sortBy) params.append('sort', sortBy);

      const queryString = params.toString();
      const url = queryString ? `/jobs/student?${queryString}` : '/jobs/student';

      const res = await api.get(url);
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
    setJobTypeFilter("");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || locationFilter || jobTypeFilter || sortBy !== "newest";

  const formatPostedTime = (date) => {
    const diff = Math.floor(
      (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24),
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  };

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);

      await api.post(`/application/apply/${jobId}`);

      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, applied: true } : j)),
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to apply";
      toast.error(msg);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-gray-700 font-normal mt-2 text-lg">
            Explore opportunities tailored for you
          </p>
        </div>

        {/* Search & filter */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Jobs</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* search */}
            <div className="lg:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* location filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>

            {/* job type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="remote">Remote</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* sort options */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="salary-high">Highest Salary</option>
                <option value="salary-low">Lowest Salary</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Briefcase className="h-12 w-12 mb-3 opacity-50" />
            <p>No jobs available right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border rounded-xl p-5 shadow-sm flex justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {getCompanyLogoUrl(job.company) ? (
                      <img
                        src={getCompanyLogoUrl(job.company)}
                        alt={getCompanyName(job.company)}
                        className="w-10 h-10 rounded-lg object-cover border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {getCompanyName(job.company).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3
                        onClick={() => navigate(`/student/job/${job._id}`)}
                        className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                      >
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {getCompanyName(job.company)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col flex-wrap max-w-max  gap-2 text-sm text-gray-700 mt-1 font-normal ">
                    <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-gray-100 ">
                      <MapPin size={17} className="text-blue-500" />
                      {job.location || "Remote"}
                    </div>

                    {job.experience && (
                      <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-gray-100 ">
                        <BriefcaseBusiness
                          size={17}
                          className="text-amber-600"
                        />
                        {job.experience}
                      </div>
                    )}

                    {job.salary && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 ">
                        <IndianRupee size={17} className="text-green-600" />
                        {job.salary}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Array.isArray(job.skillsrequired)
                      ? job.skillsrequired
                      : job.skillsrequired?.split(",") || []
                    ).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 border border-blue-100  transition"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mt-4">
                      Posted {formatPostedTime(job.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-around items-end">
                  <button
                    onClick={() => handleApply(job._id)}
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
                        : "Apply Now"}
                  </button>

                  <div>
                    <Link to={`/student/job/${job._id}`}>
                      <h2 className="text-base text-blue-700 flex items-center gap-1 font-semibold hover:underline hover:scale-105 transition-all duration-200">
                        View Details
                      </h2>
                    </Link>
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

export default StudentJobs;
