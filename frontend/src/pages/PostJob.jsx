import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { Plus, X, ArrowLeft, Briefcase, MapPin, Users, Loader2} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const PostJob = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    companyId: "",
    location: "",
    experience: "",
    salary: "",
    description: "",
    skillsrequired: [],
    jobType: "full-time",
  });

  useEffect (() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/company/getall");
      setCompanies(res.data.companies)
    } catch (err) {
      console.error(err);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;

    const newSkills = skillInput
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    const uniqueSkills = newSkills.filter(
      (skill) => !form.skillsrequired.includes(skill),
    );

    setForm({
      ...form,
      skillsrequired: [...form.skillsrequired, ...uniqueSkills],
    });

    setSkillInput(""); // clear input
  };

  const removeSkill = (skill) => {
    setForm({
      ...form,
      skillsrequired: form.skillsrequired.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyId) {
      return toast.error("Please select a company");
    }

    if (form.skillsrequired.length === 0) {
      return toast.error("Please add at least one skill");
    }

    try {
      setLoading(true);

      console.log("Sending data:", form);

      await api.post("/jobs", {
        ...form,
        skillsrequired: form.skillsrequired.join(","),
      });

      toast.success("Job posted successfully");
      navigate("/recruiter/jobs")
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Error posting job");
    } finally {
      setLoading(false);
    }
  }

  const navigate = useNavigate();
  return (
    <>
      <Layout role="recruiter">
        <div className="max-w-full  space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/recruiter/jobs")}
              className="mb-5 flex items-center gap-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
            </button>
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: "#dddee1",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Briefcase size={28} className=" text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Post a New Job
                </h1>
                <p className="text-muted-foreground">
                  Fill in the details to create a job listing
                </p>
              </div>
            </div>
          </motion.div>

          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-xl shadow space-y-6"
            >
              {/* Title & Company */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="font-semibold">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior React Developer"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                    className="w-8/12 mt-2 border-2 p-2 rounded-xl"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">Company</label>
                  {/* <input
              type="text"
              value={form.companyId}
              className="w-8/12 mt-2 border-2 p-2 rounded-xl"
              onChange={(e) => updateField("companyId", e.target.value)}
              required
              /> */}
                  <select
                    value={form.companyId}
                    onChange={(e) => updateField("companyId", e.target.value)}
                    required
                    className="w-7/12 mt-2 border-2 p-2 rounded-xl"
                  >
                    <option>Select company</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Job Type */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, India"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    required
                    className="w-8/12 mt-2 border-2 p-2 rounded-xl"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Job Type</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => updateField("jobType", e.target.value)}
                    className="w-7/12 mt-2 border-2 p-2 rounded-xl"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Experience & Salary */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="font-semibold">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g 2-3 years"
                    value={form.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                    required
                    className="w-8/12 mt-2 border-2 p-2 rounded-xl"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 LPA - 4 LPA"
                    value={form.salary}
                    onChange={(e) => updateField("salary", e.target.value)}
                    required
                    className="w-7/12 mt-2 border-2 p-2 rounded-xl gap"
                  />
                </div>
              </div>

              {/* Skills Required */}
              <div className="flex flex-col">
                <label className="font-semibold">Required Skills</label>
                <div className="flex gap-5  items-center">
                  <input
                    placeholder="e.g. React, Node.js"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="w-7/12 mt-2 border-2 p-2 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-gradient-to-r from-[#24b4fb] to-[#008cff] text-white rounded-lg px-4 h-9 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.skillsrequired.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full shadow-sm hover:shadow transition-all duration-200"
                      >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-100 transition"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="flex flex-col">
                <label className="font-semibold">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  className="mt-1 min-h-[140px] mt-2 border-2 p-2 rounded-xl"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r text-base font-semibold from-[#24b4fb] to-[#008cff] text-white rounded-lg px-4   flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Posting...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-white px-4 py-2 rounded-md font-semibold text-black hover:bg-[#ff0000] hover:text-white"
                  onClick={() => navigate("/recruiter")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default PostJob
