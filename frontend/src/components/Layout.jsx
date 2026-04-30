import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  MessagesSquare,
  ShieldAlert,
} from "lucide-react";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { motion } from "framer-motion";
import api from "../utils/api";
import { API_BASE_URL, ASSET_BASE_URL } from "../utils/config";
import { useAuth } from "../context/AuthContext";
import Notification from "./Notification";
import { connectSocket, socket } from "../utils/socket";

// admin 
const adminLinks = [
  { path: "/admin", name: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", name: "Users", icon: Users },
  { path: "/admin/jobs", name: "Jobs", icon: Briefcase },
  { path: "/admin/applications", name: "Applications", icon: FileText },
  { path: "/admin/reports", name: "Reports", icon: ShieldAlert},
];

/* Student links */
const studentLinks = [
  { path: "/student", name: "Dashboard", icon: LayoutDashboard },
  { path: "/student/jobs", name: "Jobs", icon: Briefcase },
  { path: "/student/application", name: "Application", icon: FileText },
  { path: "/student/resume", name: "Resume Analyzer", icon: FileText },
  { path: "/student/messages", name: "Messages", icon: MessagesSquare },
];

/* Recruiter links */
const recruiterLinks = [
  { path: "/recruiter", name: "Dashboard", icon: LayoutDashboard },
  { path: "/recruiter/jobs", name: "Job Posts", icon: Briefcase },
  { path: "/recruiter/applicants", name: "Applicants", icon: Users },
  { path: "/recruiter/analytics", name: "Analytics", icon: BarChart3 },
  { path: "/recruiter/messages", name: "Messages", icon: MessagesSquare },
];

const Layout = ({ role, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [showNotif, setShowNotif] = useState(false);
  const [count, setCount] = useState(0);

  const { user, logout, updateAuthUser } = useAuth();
  const notifRef = useRef();
  const profilePictureRef = useRef(null);

  const fetchCount = async () => {
    try {
      const res = await api.get("/notification/unread");
      setCount(res.data.count);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    void fetchCount();

    if (user && user._id) {
      connectSocket(user._id);
    }

    socket.on("notification", () => {
      fetchCount();
    });

    return () => {
      socket.off("notification");
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const refreshHeaderUser = async () => {
      if (!user?._id || user?.profile?.profilePicture || user?.profilePic) {
        return;
      }

      try {
        const res = await api.get("/users/profile");

        if (isMounted) {
          updateAuthUser(res.data.user);
        }
      } catch (err) {
        console.log(err);
      }
    };

    void refreshHeaderUser();

    return () => {
      isMounted = false;
    };
  }, [updateAuthUser, user?._id, user?.profile?.profilePicture, user?.profilePic]);

  const handleMarkRead = () => {
    fetchCount();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const portalTitle = {
    student: "Student Portal",
    recruiter: "Recruiter Portal",
    admin: "Admin Portal",
  };

  let links;

  if (role === "student") links = studentLinks;
  else if (role === "recruiter") links = recruiterLinks;
  else if (role === "admin") links = adminLinks;
  else links = [];

 const isActive = (path) => {
   return location.pathname === path;
 };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const getProfilePictureUrl = () => {
    const picture = user?.profile?.profilePicture || user?.profilePic;

    if (!picture) return null;
    if (picture.startsWith("http")) return picture;

    const assetBaseUrl = ASSET_BASE_URL || API_BASE_URL?.replace(/\/api\/?$/, "");
    if (!assetBaseUrl) return picture;

    if (picture.startsWith("/")) {
      return `${assetBaseUrl}${picture}`;
    }

    return `${assetBaseUrl}/uploads/profiles/${picture}`;
  };

  const profilePictureUrl = getProfilePictureUrl();

  useEffect(() => {
    if (!profilePictureUrl || profilePictureRef.current === profilePictureUrl) {
      return;
    }

    profilePictureRef.current = profilePictureUrl;

    const image = new Image();
    image.src = profilePictureUrl;
  }, [profilePictureUrl]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* sidebar */}
      <div
        className="h-full flex flex-col"
        style={{
          width: collapsed ? "4.5rem" : "14rem",
          backgroundColor: "#1d283a",
          color: "#fff",
          padding: "1.2rem 0",
          transition: "width 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.9rem",
            borderBottom: "1px solid #4a4e54",
            paddingBottom: "0.5rem",
            paddingLeft: "1rem",
          }}
        >
          <GraduationCap
            style={{ height: "2.4rem", width: "2.4rem", color: "#008cff" }}
          />
          {!collapsed && (
            <h1 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
              SmartPlace
            </h1>
          )}
        </div>

        {/* navbar */}
        <div style={{ margin: "1rem 0 2rem 0", padding: "0 1rem" }}>
          {links.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "white",
                  background: active ? "#3b82f6" : "transparent",
                }}
              >
                <Icon size={22} />
                {!collapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            left: collapsed ? "5rem" : "14.5rem",
            top: "1.4rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#2f2f57",
          }}
        >
          {collapsed ? (
            <AiOutlineMenuUnfold size={30} />
          ) : (
            <AiOutlineMenuFold size={30} />
          )}
        </button>

        {/* footer */}
        <div
          style={{
            marginTop: "auto",
            borderTop: "1px solid #4a4e54",
            padding: "0.8rem",
            gap: "0.6rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Link to="/setting" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                padding: "0.5rem",
                borderRadius: "8px",
                color: "white",
                background: isActive("/setting") ? "#3b82f6" : "transparent",
                cursor: "pointer",
              }}
            >
              <Settings size={22} />
              {!collapsed && <span>Settings</span>}
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0.5rem",
              color: "#fff",
            }}
          >
            <LogOut size={22} /> {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <header
          style={{
            height: "4.1rem",
            background: "#f0f0f8",
            borderBottom: "1px solid #cec5c5",
            display: "flex",
            alignItems: "center",
            padding: "0 3rem",
          }}
        >
          <h1
            style={{ fontSize: "1.4rem", marginLeft: "2rem" }}
            className="font-semibold text-blue-600"
          >
            {portalTitle[role] || "Portal"}
          </h1>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div ref={notifRef} style={{ position: "relative" }}>
              <div
                className="p-2 rounded-full cursor-pointer transition-all duration-200 hover:bg-blue-500 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotif(!showNotif);
                }}
              >
                <Bell className="text-gray-600 hover:text-white" size={20} />

                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[4px] bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-semibold animate-ping">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              {count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 5px",
                    borderRadius: "50%",
                  }}
                >
                  {count}
                </span>
              )}

              {showNotif && <Notification onMarkRead={handleMarkRead} />}
            </div>

            <div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => navigate(`/${role}/profile`)}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="profile"
                  className="w-full h-full object-cover"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
        </header>

        {/* content */}
        <motion.div
          className="flex-1 overflow-y-auto p-5"
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default Layout;
