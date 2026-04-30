import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Plus, Users, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from "recharts";
import api from '../utils/api';
import { socket } from "../utils/socket";

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];


const RecruiterDashboard = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/recruiter/analytics");
      
      const validatedData = {
        totalJobs: res.data.totalJobs || 0,
        activeJobs: res.data.activeJobs || 0,
        inactiveJobs: res.data.inactiveJobs || 0,
        totalApplications: res.data.totalApplications || 0,
        statusCount: res.data.statusCount || { pending: 0, reviewing: 0, accepted: 0, rejected: 0 },
        resumeViewed: res.data.resumeViewed || 0,
        applicationPerJob: Array.isArray(res.data.applicationPerJob) ? res.data.applicationPerJob : [],
        growth: res.data.growth || { newJobs: 0, newActiveJobs: 0, newApplications: 0, newResumes: 0 },
      };
      
      setData(validatedData);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserProfile();

    socket.on("statsUpdated", fetchData);

    return () => socket.off("statsUpdated", fetchData);
  }, []);

  if (loading || !user) return (
    <Layout role="recruiter">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">Loading your dashboard...</h3>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout role="recruiter">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </Layout>
  );

  if (!data) return (
    <Layout role="recruiter">
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-700">No data available</h3>
        <p className="text-gray-600 mt-2">Start by posting a new job to see analytics</p>
      </div>
    </Layout>
  );


  //card component 

 const Card = ({ title, value, Icon, growth, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
  };

  return (
    <div className="w-full p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 transition hover:shadow-md">
      <div className="flex items-center justify-between w-full"> 
        <div>
          <p className="text-base text-gray-800 mb-1">{title}</p>
          <h2 className="text-3xl font-semibold">{value}</h2>
          {growth !== undefined && (
            <p className="text-green-600 text-sm mt-1">
              +{growth} this week
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses[color]} text-white`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
    </div>
  );
};


const StatChart = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [];
  
  if (chartData.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No job postings yet. Create your first job!</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={40}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }}
          />
          <Bar 
            dataKey="applications" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatPieChart = ({data}) => {
  const statusData = {
    pending: data?.pending || 0,
    reviewing: data?.reviewing || 0,
    accepted: data?.accepted || 0,
    rejected: data?.rejected || 0,
  };

  const chartData = [
    { name: "Pending", value: statusData.pending },
    { name: "Reviewing", value: statusData.reviewing },
    { name: "Accepted", value: statusData.accepted },
    { name: "Rejected", value: statusData.rejected },
  ];

  const totalApplications = chartData.reduce((sum, item) => sum + item.value, 0);

  if (totalApplications === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No applications received yet</p>
      </div>
    );
  }

  return (
    <div className="h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={4}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }}
          />

          <Legend 
            iconType="circle"
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

  const total = data.totalApplications || 0;
  const accepted = data.statusCount?.accepted || 0;
  const rejected = data.statusCount?.rejected || 0;

  const selectionRate = total ? ((accepted / total) * 100).toFixed(1) : 0;
  const rejectionRate = total ? ((rejected / total) * 100).toFixed(1) : 0;

  const topJob = data.applicationPerJob?.reduce((max, job) =>
    job.applications > (max?.applications || 0) ? job : max,
    null
  );


  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <>
      <Layout role="recruiter">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">
              {greeting},{" "}
              <span style={{ fontWeight: "bold", color: "#008cff" }}>
                {user?.name || "User"}
              </span>
            </h1>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Recruiter Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your job postings and candidates
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/recruiter/post-job">
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#08c7f7] to-[#0284c7] text-white font-semibold text-sm px-4 h-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#08c7f7]/50">
                  <Plus className="h-4 w-4" />
                  Post New Job
                </button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
              title="Total Jobs"
              value={data.totalJobs || 0}
              growth={data.growth?.newJobs || 0}
              Icon={Briefcase}
              color="green"
            />
            <Card
              title="Active Jobs"
              value={data.activeJobs || 0}
              growth={data.growth?.newActiveJobs || 0}
              Icon={Briefcase}
              color="blue"
            />
            <Card
              title="Total Applicants"
              value={data.totalApplications || 0}
              growth={data.growth?.newApplications || 0}
              Icon={Users}
              color="purple"
            />
            <Card
              title="Resume Viewed"
              value={data.resumeViewed || 0}
              growth={data.growth?.newResumes || 0}
              Icon={FileText}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-3">Applications per Job</h2>
              <StatChart data={data.applicationPerJob} />
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold mb-3">Application Status</h2>
              <StatPieChart data={data.statusCount} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Selection Rate</p>
              <h2 className="text-xl font-bold text-green-600">
                {selectionRate}%
              </h2>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Rejection Rate</p>
              <h2 className="text-xl font-bold text-red-600">
                {rejectionRate}%
              </h2>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Top Performing Job</p>
              <h2 className="text-lg font-bold text-blue-600">
                {topJob?.name || "N/A"}
              </h2>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default RecruiterDashboard
