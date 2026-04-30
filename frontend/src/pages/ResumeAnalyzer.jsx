import React, { useState, useCallback, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Loader2,
  X,
  BarChart3,
  Target,
  GraduationCap,
  Palette,
  Zap,
  ClipboardList,
  Award,
  TrendingUp,
  Star,
  FileCheck,
  ArrowUp,
  Lightbulb,
  ListChecks,
  History,
  Eye,
  Clock,
  Download,
  Trash2,
  RefreshCw,
  Timer,
  AlertCircle,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "react-hot-toast";

// Session storage keys
const STORAGE_KEYS = {
  FILE_NAME: "resume_analyzer_fileName",
  FILE_SIZE: "resume_analyzer_fileSize",
  FILE_DATA: "resume_analyzer_fileData",
  JOB_TITLE: "resume_analyzer_jobTitle",
  JOB_DESCRIPTION: "resume_analyzer_jobDescription",
  TIMESTAMP: "resume_analyzer_timestamp",
  ANALYSIS: "resume_analyzer_analysis",
};

const SESSION_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

// Helper functions for session storage
const saveToSession = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Session storage full:", e);
  }
};

const getFromSession = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const clearSession = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

const isSessionValid = () => {
  const timestamp = getFromSession(STORAGE_KEYS.TIMESTAMP);
  if (!timestamp) return false;
  return Date.now() - timestamp < SESSION_DURATION;
};

const sectionIcons = {
  atsCompatibility: <FileCheck className="h-4 w-4" />,
  skills: <Target className="h-4 w-4" />,
  experience: <BarChart3 className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  formatting: <Palette className="h-4 w-4" />,
  impact: <Zap className="h-4 w-4" />,
  keywords: <Sparkles className="h-4 w-4" />,
};

const sectionLabels = {
  atsCompatibility: "ATS Compat",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  formatting: "Formatting",
  impact: "Impact",
  keywords: "Keywords",
};

const priorityConfig = {
  high: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertTriangle,
    label: "HIGH",
  },
  medium: {
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: Info,
    label: "MEDIUM",
  },
  low: {
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle2,
    label: "LOW",
  },
};

const ResumeScoreRing = ({ score, size = "lg" }) => {
  const dim = size === "lg" ? 180 : 100;
  const r = dim === 180 ? 72 : 40;
  const sw = dim === 180 ? 10 : 6;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={sw}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={off}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`${size === "lg" ? "text-3xl" : "text-xl"} font-bold text-gray-900`}
        >
          {score}
        </span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
};

const SectionScoreBar = ({ name, score, icon }) => {
  const color =
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          {icon}
          <span>{sectionLabels[name] || name}</span>
        </div>
        <span className="font-bold">{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
};

// Timer component showing remaining session time
const SessionTimer = ({ timestamp, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!timestamp) return;

    const updateTimer = () => {
      const remaining = SESSION_DURATION - (Date.now() - timestamp);
      if (remaining <= 0) {
        setTimeLeft(0);
        onExpire?.();
        return;
      }
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timestamp, onExpire]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      <Timer size={14} />
      <span>
        Session expires in {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null); // Store file as data URL
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionTimestamp, setSessionTimestamp] = useState(null);
  const [fileInfo, setFileInfo] = useState(null); // { name, size } when file is stored
  const fileInputRef = useRef(null);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  // Save to session whenever state changes
  useEffect(() => {
    if (file || fileDataURL || jobDescription || jobTitle || analysis) {
      saveSessionState();
    }
  }, [file, fileDataURL, jobDescription, jobTitle, analysis]);

  const saveSessionState = () => {
    if (fileInfo) {
      saveToSession(STORAGE_KEYS.FILE_NAME, fileInfo.name);
      saveToSession(STORAGE_KEYS.FILE_SIZE, fileInfo.size);
    }
    if (fileDataURL) {
      saveToSession(STORAGE_KEYS.FILE_DATA, fileDataURL);
    }
    if (jobTitle) saveToSession(STORAGE_KEYS.JOB_TITLE, jobTitle);
    if (jobDescription)
      saveToSession(STORAGE_KEYS.JOB_DESCRIPTION, jobDescription);
    if (analysis) saveToSession(STORAGE_KEYS.ANALYSIS, analysis);
    if (!sessionTimestamp) {
      const now = Date.now();
      setSessionTimestamp(now);
      saveToSession(STORAGE_KEYS.TIMESTAMP, now);
    }
  };

  const restoreSession = () => {
    if (!isSessionValid()) {
      clearSession();
      return;
    }

    const savedFileName = getFromSession(STORAGE_KEYS.FILE_NAME);
    const savedFileSize = getFromSession(STORAGE_KEYS.FILE_SIZE);
    const savedFileData = getFromSession(STORAGE_KEYS.FILE_DATA);
    const savedJobTitle = getFromSession(STORAGE_KEYS.JOB_TITLE);
    const savedJobDescription = getFromSession(STORAGE_KEYS.JOB_DESCRIPTION);
    const savedAnalysis = getFromSession(STORAGE_KEYS.ANALYSIS);
    const savedTimestamp = getFromSession(STORAGE_KEYS.TIMESTAMP);

    if (savedFileData && savedFileName) {
      // Convert data URL back to File object
      fetch(savedFileData)
        .then((res) => res.blob())
        .then((blob) => {
          const restoredFile = new File([blob], savedFileName, {
            type: blob.type,
          });
          setFile(restoredFile);
          setFileDataURL(savedFileData);
          setFileInfo({ name: savedFileName, size: savedFileSize });
          setSessionTimestamp(savedTimestamp);
        })
        .catch(() => {
          // If restoration fails, clear everything
          clearSession();
        });
    }

    if (savedJobTitle) setJobTitle(savedJobTitle);
    if (savedJobDescription) setJobDescription(savedJobDescription);
    if (savedAnalysis) setAnalysis(savedAnalysis);
    if (savedTimestamp) setSessionTimestamp(savedTimestamp);
  };

  const handleSessionExpire = () => {
    resetForm();
    toast("Session expired. Please re-upload your resume.", { icon: "⏰" });
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/resume/history");
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const handleFileSelect = (f) => {
    const valid = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!valid.includes(f.type) && !f.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      toast.error("Please upload PDF, DOCX, or TXT");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    setFile(f);
    setAnalysis(null);

    // Convert file to data URL for session storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      setFileDataURL(dataURL);
      setFileInfo({ name: f.name, size: f.size });

      // Update timestamp
      const now = Date.now();
      setSessionTimestamp(now);
      saveToSession(STORAGE_KEYS.TIMESTAMP, now);
    };
    reader.readAsDataURL(f);
  };

  const handleAnalyze = async () => {
    if (!file) return toast.error("Please upload a resume");
    const fd = new FormData();
    fd.append("resume", file);
    if (jobDescription.trim())
      fd.append("jobDescription", jobDescription.trim());
    if (jobTitle.trim()) fd.append("jobTitle", jobTitle.trim());

    setAnalyzing(true);
    try {
      const res = await api.post("/resume/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(res.data.analysis);
      saveToSession(STORAGE_KEYS.ANALYSIS, res.data.analysis);
      toast.success(`Score: ${res.data.analysis.score}/100`);
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadHistoryItem = async (id) => {
    try {
      const res = await api.get(`/resume/${id}`);
      setAnalysis(res.data.analysis);
      saveToSession(STORAGE_KEYS.ANALYSIS, res.data.analysis);
      setShowHistory(false);
      toast.success("Analysis loaded");
    } catch {
      toast.error("Failed to load");
    }
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/resume/${id}`);
      fetchHistory();
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileDataURL(null);
    setFileInfo(null);
    setAnalysis(null);
    setJobDescription("");
    setJobTitle("");
    setSessionTimestamp(null);
    clearSession();
  };

  // Show file info from session when no file object but info exists
  const displayFileInfo = file
    ? { name: file.name, size: file.size }
    : fileInfo;

  if (analyzing) {
    return (
      <Layout role="student">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analyzing Your Resume
          </h2>
          <p className="text-gray-500 mb-8">
            AI is reviewing your resume against the job description...
          </p>
          <div className="h-2 w-80 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 8, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-4">
            This usually takes 5-15 seconds
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Resume Analyzer
              </h1>
              <p className="text-sm text-gray-500">
                Get instant AI feedback and job description matching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <SessionTimer
              timestamp={sessionTimestamp}
              onExpire={handleSessionExpire}
            /> */}
            <button
              onClick={() => {
                fetchHistory();
                setShowHistory(!showHistory);
              }}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <History size={16} /> History{" "}
              {history.length > 0 && `(${history.length})`}
            </button>
          </div>
        </div>

        {/* 
        {displayFileInfo && !analysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <FileText size={16} />
              <span>
                <strong>{displayFileInfo.name}</strong> (
                {(displayFileInfo.size / 1024).toFixed(1)} KB) is ready for
                analysis
              </span>
            </div>
            <span className="text-xs text-blue-500">
              You can navigate to other pages - data is saved for 3 minutes
            </span>
          </div>
        )} */}

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border p-6 shadow-sm mb-4">
                <h3 className="font-semibold mb-4">Analysis History</h3>
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No previous analyses.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition border"
                      >
                        <div
                          onClick={() => loadHistoryItem(item._id)}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              {item.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}{" "}
                              {item.jobTitle && `• ${item.jobTitle}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.score >= 80 ? "bg-green-100 text-green-700" : item.score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                          >
                            {item.score}/100
                          </span>
                          <button
                            onClick={(e) => deleteHistoryItem(item._id, e)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Section */}
        {!analysis && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FileText size={26} color="blue"/> Upload Resume & Job Description
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Resume Upload */}
              <div>
                <h3 className="font-medium mb-3">
                  Resume <span className="text-red-500">*</span>
                </h3>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${dragActive ? "border-blue-500 bg-blue-50" : displayFileInfo ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                  {displayFileInfo ? (
                    <div className="flex items-center gap-4">
                      <FileText className="h-10 w-10 text-green-600" />
                      <div>
                        <p className="font-medium">{displayFileInfo.name}</p>
                        <p className="text-sm text-gray-500">
                          {(displayFileInfo.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetForm();
                        }}
                        className="p-2 hover:bg-red-100 rounded-full"
                      >
                        <X className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-blue-600 mb-3" />
                      <p className="font-medium text-gray-900">
                        Drop your resume here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PDF, DOCX, TXT (max 5MB) • Auto-saved for 3 minutes
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-3">
                  Job Description{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    (optional)
                  </span>
                </h3>
                {/* <input
                  type="text"
                  placeholder="Job Title (e.g., Senior React Developer)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg mb-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                /> */}
                <textarea
                  placeholder="Paste job description for tailored feedback and keyword matching..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg min-h-[120px] text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                />
              </div>

              {displayFileInfo && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="h-5 w-5" /> Analyze Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back & Download */}
              <div className="flex justify-between">
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Upload size={16} /> New Analysis
                </button>
                {/* <div className="flex items-center gap-3">
                  <button
                    onClick={() => toast.success("Report ready!")}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Download size={16} /> Download
                  </button>
                </div> */}
              </div>

              {/* ATS + Overall */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl text-center border border-blue-200">
                  <FileCheck className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-semibold">
                    ATS Score
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {analysis.atsScore}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl text-center border border-green-200">
                  <Target className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-semibold">
                    Overall Match
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {analysis.score}%
                  </p>
                </div>
              </div>

              {/* Score Ring + Summary */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="bg-white rounded-2xl border p-6 flex flex-col items-center shadow-sm">
                  <h3 className="font-semibold mb-4">Overall Score</h3>
                  <ResumeScoreRing score={analysis.score} />
                </div>
                <div className="bg-white rounded-2xl border p-6 lg:col-span-2 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {analysis.summary}
                    </p>
                  </div>
                  <hr />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />{" "}
                      Strengths
                    </h4>
                    {analysis.strengths?.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm mb-1"
                      >
                        <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{s}</span>
                      </div>
                    ))}
                  </div>
                  {analysis.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />{" "}
                        Areas to Improve
                      </h4>
                      {analysis.weaknesses.map((w, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm mb-1"
                        >
                          <ChevronRight className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <span className="text-gray-600">{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section Scores */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Section Breakdown</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {analysis.sectionScores &&
                    Object.entries(analysis.sectionScores).map(([key, val]) => (
                      <SectionScoreBar
                        key={key}
                        name={key}
                        score={val}
                        icon={sectionIcons[key] || <Star className="h-4 w-4" />}
                      />
                    ))}
                </div>
              </div>

              {/* Match Analysis */}
              {analysis.matchAnalysis && (
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">Match Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(analysis.matchAnalysis).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="text-center p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="text-xl font-bold text-indigo-600">
                            {val}%
                          </div>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Feedback */}
              {analysis.detailedFeedback && (
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">
                    Detailed Section Feedback
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analysis.detailedFeedback).map(
                      ([key, fb]) =>
                        fb && (
                          <div key={key} className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-medium text-sm capitalize mb-1">
                              {key.replace("Feedback", "")}
                            </h4>
                            <p className="text-sm text-gray-600">{fb}</p>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {/* ATS Tips */}
              {analysis.atsTips?.length > 0 && (
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">ATS Optimization Tips</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {analysis.atsTips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg"
                      >
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Improvement Suggestions</h3>
                <div className="space-y-3">
                  {analysis.improvements?.map((imp, i) => {
                    const cfg =
                      priorityConfig[imp.priority] || priorityConfig.medium;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-3 rounded-xl p-4 ${cfg.bg} border ${cfg.border}`}
                      >
                        <Icon
                          className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {imp.text}
                          </p>
                          <div className="flex gap-2 mt-1.5">
                            {imp.category && (
                              <span className="px-2 py-0.5 bg-white rounded text-xs text-gray-500">
                                {imp.category}
                              </span>
                            )}
                            {imp.impact && (
                              <span className="text-xs text-gray-400">
                                {imp.impact}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold uppercase ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action Plan */}
              {analysis.actionPlan?.length > 0 && (
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-purple-600" /> Your
                    Action Plan
                  </h3>
                  <div className="space-y-3">
                    {analysis.actionPlan.map((step) => (
                      <div
                        key={step.step}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                      >
                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {step.action}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.reason}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-white border">
                              Effort: {step.effort}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-white border">
                              Impact: {step.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Detected
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.detectedSkills?.length > 0 ? (
                      analysis.detectedSkills.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No skills detected
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" /> Missing
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords?.length > 0 ? (
                      analysis.missingKeywords.map((k, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700"
                        >
                          + {k}
                        </span>
                      ))
                    ) : (
                      <p className="text-green-600 text-sm">
                        No critical keywords missing!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Format Issues & Recommendations */}
              <div className="grid gap-6 lg:grid-cols-2">
                {analysis.formatIssues?.length > 0 && (
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Format Issues Found</h3>
                    {analysis.formatIssues.map((issue, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm mb-2"
                      >
                        <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.recommendedFormats?.length > 0 && (
                  <div className="bg-white rounded-2xl border p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Recommended Formats</h3>
                    {analysis.recommendedFormats.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm mb-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ResumeAnalyzer;
