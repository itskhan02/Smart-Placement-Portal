import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const EditCompany = ({ companyId: propCompanyId, onBack }) => {
  const { id: routeCompanyId } = useParams();
  const navigate = useNavigate();
  const companyId = propCompanyId || routeCompanyId;

  const [form, setForm] = useState({
    name: "",
    website: "",
    location: "",
    description: "",
    isPublic: true,
  });

  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);


  const fetchCompany = async () => {
    if (!companyId) return;

    try {
      const res = await api.get(`/company/get/${companyId}`);

      const c = res.data.company;

      setForm({
        name: c.name || "",
        website: c.website || "",
        location: c.location || "",
        description: c.description || "",
        isPublic: c.isPublic ?? true,
      });

      if (c.logo) {
        setPreview(`http://localhost:8000${c.logo}`);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setLogo(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.name) return toast.error("Company name required");

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (logo) {
        data.append("logo", logo);
      }

      await api.put(`/company/update/${companyId}`, data);

      toast.success("Company updated successfully");
      if (onBack) {
        onBack();
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.log(err);
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Edit Company</h2>

      {preview && (
        <img src={preview} className="w-20 h-20 rounded-full object-cover" />
      )}

      <input type="file" onChange={handleFile} />

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Company Name"
        className="w-full border p-2 rounded"
      />

      <input
        name="website"
        value={form.website}
        onChange={handleChange}
        placeholder="Website"
        className="w-full border p-2 rounded"
      />

      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location"
        className="w-full border p-2 rounded"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border p-2 rounded"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublic"
          checked={form.isPublic}
          onChange={handleChange}
        />
        Public Listing
      </label>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Company
      </button>
    </div>
  );
};

export default EditCompany;
