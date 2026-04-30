import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import { socket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  FileText,
  GraduationCap,
  ShieldAlert,
  Users,
  Building2,
  TrendingUp,
  Activity,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Flag,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Award,
  ThumbsUp,
  TrendingUp as TrendingUpIcon,
  PieChart,
  MapPin,
  Clock,
  Eye,
  Sparkles,
  Zap,
  Crown,
  Medal,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [trendingJobsLoading, setTrendingJobsLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin/dashboard");
      setData(res.data);

      const activityRes = await api.get("/admin/recent-activity");
      setRecentActivity(activityRes.data.activities || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      toast.error(
        err.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendingJobs = useCallback(async () => {
    try {
      setTrendingJobsLoading(true);
      // Fetch jobs with most applications
      const res = await api.get("/admin/jobs?sort=applications&limit=5");
      if (res.data?.jobs) {
        const formattedJobs = res.data.jobs.map((job, index) => ({
          id: job._id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
          location: job.location || "Remote",
          applications: job.applicationsCount || job.application?.length || 0,
          matchRate: Math.floor(Math.random() * 30) + 65, // Mock match rate (replace with real data if available)
          postedAt: job.createdAt,
          salary: job.salary,
          jobType: job.jobType,
        }));
        setTrendingJobs(formattedJobs.slice(0, 5));
      } else {
        // Fallback to mock data if API not ready
        setTrendingJobs([
          {
            id: 1,
            title: "Senior Software Engineer",
            company: "Google",
            location: "Bangalore",
            applications: 45,
            matchRate: 78,
            postedAt: new Date().toISOString(),
            salary: "₹25-35 LPA",
            jobType: "full-time",
          },
          {
            id: 2,
            title: "Frontend Developer",
            company: "Microsoft",
            location: "Hyderabad",
            applications: 38,
            matchRate: 72,
            postedAt: new Date().toISOString(),
            salary: "₹18-25 LPA",
            jobType: "full-time",
          },
          {
            id: 3,
            title: "Product Manager",
            company: "Amazon",
            location: "Remote",
            applications: 32,
            matchRate: 68,
            postedAt: new Date().toISOString(),
            salary: "₹30-40 LPA",
            jobType: "remote",
          },
          {
            id: 4,
            title: "Data Scientist",
            company: "Meta",
            location: "Bangalore",
            applications: 28,
            matchRate: 65,
            postedAt: new Date().toISOString(),
            salary: "₹22-32 LPA",
            jobType: "full-time",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching trending jobs:", err);
      // Fallback mock data
      setTrendingJobs([
        {
          id: 1,
          title: "Senior Software Engineer",
          company: "Google",
          location: "Bangalore",
          applications: 45,
          matchRate: 78,
          postedAt: new Date().toISOString(),
          salary: "₹25-35 LPA",
          jobType: "full-time",
        },
        {
          id: 2,
          title: "Frontend Developer",
          company: "Microsoft",
          location: "Hyderabad",
          applications: 38,
          matchRate: 72,
          postedAt: new Date().toISOString(),
          salary: "₹18-25 LPA",
          jobType: "full-time",
        },
        {
          id: 3,
          title: "Product Manager",
          company: "Amazon",
          location: "Remote",
          applications: 38,
          matchRate: 68,
          postedAt: new Date().toISOString(),
          salary: "₹30-40 LPA",
          jobType: "remote",
        },
      ]);
    } finally {
      setTrendingJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchTrendingJobs();

    socket.on("statsUpdated", fetchDashboardData);
    socket.on("newRegistration", fetchDashboardData);
    socket.on("newReport", fetchDashboardData);
    socket.on("newApplication", fetchTrendingJobs);

    return () => {
      socket.off("statsUpdated", fetchDashboardData);
      socket.off("newRegistration", fetchDashboardData);
      socket.off("newReport", fetchDashboardData);
      socket.off("newApplication", fetchTrendingJobs);
    };
  }, [fetchDashboardData, fetchTrendingJobs]);

  const formatTimeAgo = (date) => {
    if (!date) return "Recently";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const trends = {
    students: data?.trends?.students || 12,
    jobs: data?.trends?.jobs || 15,
    applications: data?.trends?.applications || 20,
  };

  const weeklyActivityData = data?.weeklyStats || [
    { day: "Mon", students: 5, applications: 15 },
    { day: "Tue", students: 8, applications: 22 },
    { day: "Wed", students: 6, applications: 18 },
    { day: "Thu", students: 10, applications: 28 },
    { day: "Fri", students: 7, applications: 20 },
    { day: "Sat", students: 3, applications: 8 },
    { day: "Sun", students: 2, applications: 6 },
  ];

  const applicationStatusData = [
    {
      name: "Pending",
      value: data?.applicationStats?.pending || 0,
      color: "#eab308",
    },
    {
      name: "Reviewing",
      value: data?.applicationStats?.reviewing || 0,
      color: "#3b82f6",
    },
    {
      name: "Accepted",
      value: data?.applicationStats?.accepted || 0,
      color: "#22c55e",
    },
    {
      name: "Rejected",
      value: data?.applicationStats?.rejected || 0,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading && !data) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700">
              Loading Dashboard...
            </h3>
            <p className="text-gray-500 mt-2">Fetching latest analytics</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              Failed to Load Dashboard
            </h3>
            <p className="text-red-500 mt-2">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section with Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {user?.name || "Admin"}
              </span>
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening on your platform today
            </p>
          </div>
          {/* <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              <Sparkles size={14} className="text-yellow-500" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div> */}
        </motion.div>

        {/* Main Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Total Users Card */}
          <div className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg flex items-center gap-2 group-hover:bg-blue-100 transition">
                <Users className="h-5 w-5 text-blue-600" />
                <h1 className="text-base font-semibold text-gray-500">
                  Total Users
                </h1>
              </div>
              {trends.students > 0 ? (
                <span className="text-xs text-green-600 flex font-semibold items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUp size={12} />
                  {trends.students}%
                </span>
              ) : (
                <span className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDown size={12} /> {Math.abs(trends.students)}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data?.totalUsers || 0}
            </p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">Students</span>
                <span className="font-semibold text-gray-900 ml-1">
                  {data?.students || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">Recruiters</span>
                <span className="font-semibold text-gray-900 ml-1">
                  {data?.recruiters || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Total Jobs Card */}
          <div className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg flex items-center gap-2 group-hover:bg-emerald-100 transition">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <p className="text-base font-semibold text-gray-500">
                  Total Jobs
                </p>
              </div>
              {trends.jobs > 0 ? (
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUp size={12} />
                  {trends.jobs}%
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDown size={12} /> {Math.abs(trends.jobs)}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data?.jobs || 0}
            </p>
            <p className="text-xs text-gray-400 mt-2">Active listings</p>
          </div>

          {/* Applications Card */}
          <div className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg flex items-center gap-2 group-hover:bg-purple-100 transition">
                <FileText className="h-5 w-5 text-purple-600" />
                <p className="text-base font-semibold text-gray-500">
                  Applications
                </p>
              </div>
              {trends.applications > 0 ? (
                <span className="text-xs font-semibold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUp size={12} /> {trends.applications}%
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDown size={12} /> {Math.abs(trends.applications)}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data?.applications || 0}
            </p>
            <p className="text-xs text-gray-400 mt-2">Total submissions</p>
          </div>

          {/* Reports Card */}
          <div className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-50 rounded-lg flex items-center gap-2 group-hover:bg-orange-100 transition">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
                <p className="text-base font-semibold text-gray-500">Reports</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data?.reports || 0}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Pending review: {data?.pendingActions?.reports || 0}
            </p>
          </div>
        </motion.div>

        {/* <div className="grid  grid-cols-1 lg:grid-cols-3 gap-6"> */}
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Weekly Activity
                </h3>
                <p className="text-sm text-gray-500">
                  New students and applications over the week
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Students</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Applications</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorApplications"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    strokeWidth={2}
                    name="New Students"
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                    strokeWidth={2}
                    name="Applications"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        {/* </div> */}

        {/* Recent Activity & Trending Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Latest actions on the platform
                  </p>
                </div>
                <Zap size={18} className="text-yellow-500" />
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 6).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        activity.type === "registration"
                          ? "bg-green-100"
                          : activity.type === "report"
                            ? "bg-red-100"
                            : activity.type === "application"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {activity.type === "registration" && (
                        <UserCheck size={16} className="text-green-600" />
                      )}
                      {activity.type === "report" && (
                        <Flag size={16} className="text-red-600" />
                      )}
                      {activity.type === "application" && (
                        <FileText size={16} className="text-blue-600" />
                      )}
                      {activity.type === "message" && (
                        <MessageSquare size={16} className="text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trending Jobs Section */}
          <div className="space-y-6">
            {/* Trending Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                      <TrendingUpIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Trending Jobs
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Most applied jobs this week
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/admin/jobs"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {trendingJobsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : trendingJobs.length > 0 ? (
                  trendingJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 text-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                              {job.title}
                            </h4>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Building2 size={10} />
                              {job.company}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={10} />
                              {job.location}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTimeAgo(job.postedAt)}
                            </span>
                            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                              <Eye size={10} />
                              {job.applications} applications
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                                style={{ width: `${job.matchRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-green-600">
                              {job.matchRate}% match
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.jobType === "remote"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {job.jobType === "remote" ? "Remote" : "Full-time"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No jobs available</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Zap className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-4 mt-4">
                <Link
                  to="/admin/users"
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-blue-50 transition text-sm font-medium text-gray-600 hover:text-blue-600 group"
                >
                  <Users size={16} className="group-hover:text-blue-600" />
                  Manage Users
                </Link>
                <Link
                  to="/admin/companies"
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-purple-50 transition text-sm font-medium text-gray-600 hover:text-purple-600 group"
                >
                  <Building2
                    size={16}
                    className="group-hover:text-purple-600"
                  />
                  Companies
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-red-50 transition text-sm font-medium text-gray-600 hover:text-red-600 group"
                >
                  <ShieldAlert size={16} className="group-hover:text-red-600" />
                  Reports
                </Link>
                <Link
                  to="/admin/jobs"
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-emerald-50 transition text-sm font-medium text-gray-600 hover:text-emerald-600 group"
                >
                  <Briefcase
                    size={16}
                    className="group-hover:text-emerald-600"
                  />
                  Jobs
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
