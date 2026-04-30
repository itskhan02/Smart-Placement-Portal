import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Building2, Globe, MapPin, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ASSET_BASE_URL } from "../../utils/config";

const CompanyControls = ({onEdit}) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    if (company) {
      setIsPublic(company.isPublic || false);
    }
  }, [company]);

  const fetchCompany = async () => {
    try {
      const res = await api.get("/users/profile");
      setCompany(res.data.user.profile?.company || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async () => {
    try {
      const newValue = !isPublic;
      setIsPublic(newValue);

      await api.put(`/company/update/${company._id}`, {
        isPublic: newValue,
      });
    } catch (err) {
      console.log(err);
      setIsPublic(!isPublic);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="text-gray-600" />
        <div>
          <h2 className="text-xl font-semibold">Company Controls</h2>
          <p className="text-sm text-gray-500">
            Manage your company profile and visibility
          </p>
        </div>
      </div>

      {!company && (
        <div className="border rounded-xl p-6 text-center space-y-4 bg-gray-50">
          <p className="text-gray-600">No company found</p>

          <button
            onClick={() => navigate("/recruiter/create-company")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Company
          </button>
        </div>
      )}

      {company && (
        <div className="border rounded-xl p-6 space-y-5 bg-white shadow-sm">
          {/* Edit Button */}
          <div className="flex justify-end">
            <button
              onClick={() => onEdit(company._id)}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Pencil size={16} />
              Edit Company Profile
            </button>
          </div>

          <hr />

          {/* Company Info */}
          <div className="flex gap-4 items-center">
            {company.logo && (
              <img
                src={`${ASSET_BASE_URL}${company.logo}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}

            <div>
              <h3 className="text-lg font-semibold">{company.name}</h3>

              {company.website && (
                <p className="flex items-center gap-1 text-sm text-blue-600">
                  <Globe size={14} />
                  {company.website}
                </p>
              )}

              {company.location && (
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  {company.location}
                </p>
              )}
            </div>
          </div>

          {company.description && (
            <p className="text-sm text-gray-600">{company.description}</p>
          )}

          {/* Visibility */}
          <div className="flex justify-between items-center border-t pt-4">
            <div>
              <p className="font-medium">Show Company in Public Listings</p>
              <p className="text-sm text-gray-500">
                Let students discover your company
              </p>
            </div>

            <div
              onClick={toggleVisibility}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition ${
                isPublic ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  isPublic ? "left-7" : "left-1"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyControls;
