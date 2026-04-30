import React, { useState, useEffect} from "react";
import Layout from "../components/Layout";
import SettingLayout from "../components/setting/SettingLayout";
import AccountSetting from "../components/setting/AccountSetting";
import NotificationSetting from "../components/setting/NotificationSetting";
import Security from "../components/setting/Security";
import useSettings from "../hooks/useSettings";
import CompanyControls from "../components/setting/CompanyControls";
import { useAuth } from "../context/AuthContext";
import EditCompany from "./EditComapny";

const Settings = () => {
  const [active, setActive] = useState(() => { return localStorage.getItem("settingsTab") || "security";});
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    localStorage.setItem("settingsTab", active);
  }, [active]);

  const { user } = useAuth();
  const role = user?.role || "student";

  const { settings, loading, updateSettingsField, changePassword, logoutAll } =
    useSettings();


  const handleEditCompany = (id) => {
    console.log("EDIT ID:", id);
    setCompanyId(id);
    setActive("editCompany");
  };


  const handleBackToCompany = () => {
    setActive("company");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <Layout role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account, notifications, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 lg:gap-6">
          <div>
            <SettingLayout active={active} setActive={setActive} role={role} />
          </div>

          {/* Content */}
          <div
            key={active}
            className="space-y-4"
          >
            {active !== "account" && (
              <div className="bg-white border rounded-xl shadow-sm p-5">
                {active === "security" && (
                  <Security
                    changePassword={changePassword}
                    logoutAll={logoutAll}
                  />
                )}

                {active === "notifications" && (
                  <NotificationSetting
                    settings={settings}
                    updateSettingsField={updateSettingsField}
                    role={role}
                  />
                )}

                {active === "company" && (
                  <CompanyControls onEdit={handleEditCompany} />
                )}

                {active === "editCompany" && (
                  <EditCompany
                    companyId={companyId}
                    onBack={handleBackToCompany}
                  />
                )}
              </div>
            )}

            {active === "account" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                <AccountSetting />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
