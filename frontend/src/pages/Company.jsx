import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const Company = () => {
  const [form, setForm] = useState({
    companyName: "",
    description: "",
    website: "",
    location: "",
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName.trim()) {
      return toast.error("Please enter a company name");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v)
      );

      if (logo) formData.append("logo", logo);

      await api.post("/company/create", formData);

      toast.success("Company created successfully");
      navigate("/recruiter/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Error creating Company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <h2 className="text-lg sm:text-xl font-semibold">Create Company</h2>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Company Logo
        </label>

        <input type="file" accept="image/*" onChange={handleLogo} />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 w-20 h-20 rounded-full object-cover border"
          />
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Company Name</label>
          <input
            value={form.companyName}
            placeholder="Company Name"
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            placeholder="Brief description about the company"
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Website</label>
          <input
            value={form.website}
            placeholder="Website"
            onChange={(e) => handleChange("website", e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input
            value={form.location}
            placeholder="Location"
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 rounded-lg font-medium shadow hover:shadow-md transition"
      >
        {loading ? "Creating..." : "Create Company"}
      </button>

    </form>
  );
};

export default Company;
