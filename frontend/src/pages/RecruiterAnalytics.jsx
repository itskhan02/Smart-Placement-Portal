import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import { Briefcase, CircleCheckBig, CircleX, Clock, Eye, Users } from "lucide-react";


const RecruiterAnalytics = () => {
  const[data, setData] = useState(null);
  const [apps, setApps] = useState([]);

  const fetchAnalytics = async () => {
    const res = await api.get("/recruiter/analytics");
    setData(res.data);
  };

  const fetchApplicants = async () => {
    const res = await api.get("/application/recruiter/all");
    setApps(res.data.applications || []);
  };

  useEffect(() => {
    void fetchAnalytics();
    void fetchApplicants();
  }, []);
  
  const getScore = (app) => {
    let score = 0;

    if (app.applicant?.profile?.resume?.fileUrl) score += 20;

    const skills = app.applicant?.profile?.skills || [];
    score += skills.length * 2;

    const exp = app.applicant?.profile?.experience || [];
    score += exp.length * 5;

    if (app.status === "accepted") score += 30;
    else if (app.status === "reviewing") score += 20;
    else if (app.status === "pending") score += 10;

    return score;
  };

  const topCandidates = [...apps]
    .map(app => ({
      ...app,
      score: getScore(app),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  //card 
  const Card = ({ title, value, Icon }) => {
    const cardStyles = {
  "Total Jobs": "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white",
  "Active Jobs": "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
  "Inactive Jobs": "bg-gradient-to-br from-rose-500 to-rose-600 text-white",
  "Total Applicants": "bg-gradient-to-br from-sky-500 to-sky-600 text-white",
};
  return (
    <div className="w-full h-30 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow border border-gray-200 transition">
    
      <div className="flex items-center justify-between h-full">
        
        <div>
          <p className="text-base text-gray-800 mb-2">{title}</p>
          <h2 className="text-3xl font-semibold">{value}</h2>
        </div>

        <div className={`p-3 rounded-2xl shadow-sm ${cardStyles[title]}`}>
          <Icon size={28} className=" text-white" />
        </div>

      </div>
    </div>
  );
};

const StatusBox = ({ label, value, Icon }) => {
  const getColor = () => {
    switch (label) {
      case "Accepted":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Reviewing":
        return "text-blue-600 bg-blue-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="w-full p-6 bg-white/30 backdrop-blur-xl rounded-2xl  border border-white/20transition">
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-base text-gray-800 mb-2">{label}</p>
          <h2 className="text-2xl font-semibold">{value}</h2>
        </div>
        <div className={`p-3 rounded-full ${getColor()}`}>
        <Icon className="w-6 h-6" />
      </div>
      </div>
    </div>
  );
};

  if (!data) return <Layout role="recruiter">Loading...</Layout>;
  

return (
  <Layout role="recruiter">
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Insights across all your job postings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Jobs" value={data.totalJobs || 0} Icon={Briefcase} />
        <Card
          title="Active Jobs"
          value={data.activeJobs || 0}
          Icon={Briefcase}
        />
        <Card
          title="Inactive Jobs"
          value={data.inactiveJobs || 0}
          Icon={Briefcase}
        />
        <Card
          title="Total Applicants"
          value={data.totalApplications || 0}
          Icon={Users}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border-2 shadow">
        <h2 className="text-xl font-semibold mb-4">Applications </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatusBox
            label="Accepted"
            value={data.statusCount?.accepted}
            Icon={CircleCheckBig}
          />
          <StatusBox
            label="Pending"
            value={data.statusCount?.pending}
            Icon={Clock}
          />
          <StatusBox
            label="Reviewing"
            value={data.statusCount?.reviewing}
            Icon={Eye}
          />
          <StatusBox
            label="Rejected"
            value={data.statusCount?.rejected}
            Icon={CircleX}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Top Candidates</h2>

        {topCandidates.length === 0 ? (
          <p>No applicants found.</p>
        ) : (
          topCandidates.map((app) => (
            <div
              key={app._id}
              className="flex justify-between items-center border-b py-3"
            >
              <div>
                <p className="font-semibold">{app.applicant?.name}</p>

                <p className="text-sm text-gray-500">{app.applicant?.email}</p>

                <p className="text-sm text-gray-400">
                  Skills:{" "}
                  {(app.applicant?.profile?.skills || []).join(", ") || "N/A"}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-blue-600">Score: {app.score}</p>

                <p className="text-sm capitalize">{app.status}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Applications per Job</h2>

        {data.applicationPerJob.map((job, i) => (
          <div key={i} className="flex justify-between py-1">
            <span>{job.name}</span>
            <span>{job.applications}</span>
          </div>
        ))}
      </div>

    </div>
  </Layout>
);
};

export default RecruiterAnalytics
