import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../components/Layout";
import api from "../utils/api";
import { BriefcaseBusiness, IndianRupee, MapPin, MoveLeft } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [companyLogoError, setCompanyLogoError] = useState(false);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/details/${id}`);
      setJob(res.data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPostedTime = (date) => {
    if (!date) return "Recently";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "Recently";

    const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  };

  const handleApply = async () => {
    try {
      setApplying(true);

      await api.post(`/application/apply/${job._id}`);

      // mark applied instantly
      setJob((prev) => ({ ...prev, applied: true }));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to apply";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <Layout role="student">Loading...</Layout>;
  }

  if (!job) {
    return <Layout role="student">Job not found</Layout>;
  }

  const companyName = job.company?.name || job.company?.companyName || "Company";
  const companyLogoUrl = job.company?.logo
    ? job.company.logo.startsWith("http")
      ? job.company.logo
      : `http://localhost:8000${job.company.logo}`
    : null;

      

  return (
    <Layout role="student">
      <div className="mb-2">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 rounded-full  hover:bg-blue-500 hover:text-white transition-all duration-200"
          >
            <MoveLeft size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            {companyLogoUrl && !companyLogoError ? (
              <img
                src={companyLogoUrl}
                alt={companyName}
                onError={() => setCompanyLogoError(true)}
                className="w-16 h-16 rounded-lg object-cover border bg-gray-50"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {job.title}
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                <a href={job.company.website}> {companyName}</a>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600 border-b pb-4">
          {job.location && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <MapPin size="16" className="text-blue-500" />
              {job.location}
            </span>
          )}
          {job.experience && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <BriefcaseBusiness size="16" className="text-amber-600" />
              {job.experience}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <IndianRupee size="16" className="text-green-600" />
              {job.salary}
            </span>
          )}
          {job.jobType && (
            <span className="bg-gray-50 px-3 py-1.5 rounded-full">
              {job.jobType.replace("-", " ").toUpperCase()}
            </span>
          )}

          <div>
            <p className="text-xs text-gray-400 mt-2">
              Posted {formatPostedTime(job.postedAt)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            Job Description
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        {job.skillsrequired && job.skillsrequired.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsrequired.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 border border-blue-100  transition"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.company && (job.company.website || job.company.description) && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              About {companyName}
            </h3>
            {job.company.description && (
              <p className="text-gray-600 text-sm mb-2">
                {job.company.description}
              </p>
            )}
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Visit Website →
              </a>
            )}
          </div>
        )}

        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={handleApply}
            disabled={job.applied || applying}
            className={`px-5 py-3 rounded-xl text-white text-base font-medium transition-all duration-200 ${
              job.applied
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-600 font-semibold hover:bg-blue-200 hover:text-blue-800 active:scale-95 transition-all duration-200"
            }`}
          >
            {job.applied ? " Applied" : applying ? "Applying..." : "Apply Now"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails;
