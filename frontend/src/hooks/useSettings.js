import { useState, useEffect } from "react";
import api from "../utils/api";

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const res = await api.get("/settings");
    setSettings(res.data.settings);
    setLoading(false);
  };

  const updateSettings = async (updated) => {
    const res = await api.put("/settings", updated);
    setSettings(res.data.settings);
  };

const updateSettingsField = async (path, value) => {
  try {
    await api.put("/settings", { path, value });

    setSettings((prev) => {
      const updated = { ...prev };

      const keys = path.split(".");
      let obj = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}; // 🔥 ADD THIS
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;

      return { ...updated };
    });
  } catch (err) {
    console.log(err);
  }
};

  const changePassword = (data) => api.put("/settings/password", data);

  const logoutAll = async () => {
    try {
      await api.post("/settings/logout-all");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    updateSettingsField,
    changePassword,
    logoutAll,
  };



}
