import React, { useState } from "react";
import {
  FileText,
  Briefcase,
  BarChart3,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "AI Resume Analyzer",
    desc: "Get instant scoring, keyword analysis, and improvement suggestions for your resume.",
  },
  {
    icon: Briefcase,
    title: "Smart Job Matching",
    desc: "AI-powered job recommendations based on your skills, experience, and preferences.",
  },
  {
    icon: BarChart3,
    title: "Application Tracking",
    desc: "Track all your applications in one place with real-time status updates.",
  },
  {
    icon: Users,
    title: "Recruiter Dashboard",
    desc: "Post jobs, rank candidates with AI, and manage your hiring pipeline effortlessly.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    desc: "Data-driven analytics to optimize your job search or recruitment strategy.",
  },
  {
    icon: CheckCircle,
    title: "Skill Gap Analysis",
    desc: "Identify missing skills and get personalized learning recommendations.",
  },
];

const Features = () => {
  const [hoverIndex, setHoverIndex] = useState(null);

  return <>
    <div className="features">
      <div
        className="text-center px-4"
        style={{ marginTop: "2.5rem", marginBottom: "2rem" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Everything You Need to Succeed
        </h1>

        <p
          className="mt-4 text-muted-foreground max-w-2xl mx-auto"
          style={{ maxWidth: "600px", marginTop: "1rem", fontSize: "1.1rem" }}
        >
          From resume analysis to job matching, our AI-powered platform
          streamlines your entire placement journey
        </p>
      </div>

      {/*Cards Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 px-6 md:px-16">
        {features.map((feature, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            className="card border rounded-xl transition-all duration-300"
            style={{
              padding: "1.8rem",
              transform:
                hoverIndex === i ? "translateY(-6px)" : "translateY(0)",
              boxShadow:
                hoverIndex === i
                  ? "0 12px 25px rgba(0,0,0,0.15)"
                  : "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
              background: "rgba( 255, 255, 255, 0.05 )",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(156, 156, 156, 0.43)",
              borderRadius: "16px",
            }}
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center"
              style={{
                width: "50px",
                height: "50px",
                background: "#2563eb",
                borderRadius: "50%",
                marginBottom: "1rem",
              }}
            >
              <feature.icon size={22} color="#fff" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold">{feature.title}</h3>

            {/* Description */}
            <p
              className="text-gray-500 text-sm"
              style={{ marginTop: "0.8rem", lineHeight: "1.6" }}
            >
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div
        className="text-center text-white mt-20 px-4"
        style={{
          background: "linear-gradient(to right, #2563eb, #4f46e5)",
          padding: "4rem 1rem",
        }}
      >
        <h1 className="text-3xl font-semibold">
          Ready to Supercharge Your Career?
        </h1>

        <p
          className="mx-auto"
          style={{
            marginTop: "1rem",
            maxWidth: "500px",
            color: "#e0e7ff",
          }}
        >
          Thousands of students and recruiters are already using SmartPlace.
          AI-powered platform to hire and get hired faster.
        </p>

        {/* Button */}
        <Link to="/register">
          <button
            className="flex items-center gap-2 mx-auto mt-6"
            style={{
              background: "#fff",
              color: "#000",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.08)";
              e.target.style.boxShadow =
                "0 8px 20px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            Get Started Free <ArrowRight size={18} />
          </button>
        </Link>
      </div>
    </div>
  </>
};

export default Features;