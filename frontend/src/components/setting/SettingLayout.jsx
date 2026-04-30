import { Bell, Building2, Shield, ShieldUser } from "lucide-react";
import React from "react";

const SettingLayout = ({ active, setActive, role = "student" }) => {
  const studentItems = [
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    // { id: "theme", label: "Theme", icon: ShieldUser },
    { id: "account", label: "Manage Account", icon: ShieldUser },
  ];

  const recruiterItems = [
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "company", label: "Company Controls", icon: Building2 },
    // { id: "theme", label: "Theme", icon: ShieldUser },
    { id: "account", label: "Manage Account", icon: ShieldUser },
  ];

  const adminItems = [
    { id: "security", label: "Security & Privacy", icon: Shield },
    // { id: "notifications", label: "Notifications", icon: Bell },
    // { id: "theme", label: "Theme", icon: ShieldUser },
    { id: "account", label: "Manage Account", icon: ShieldUser },
  ];

  let items;

  if (role === "student") items = studentItems;
  else if (role === "recruiter") items = recruiterItems;
  else if (role === "admin") items = adminItems;
  else items = [];

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;

        return (
          <div
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm sm:text-base font-medium transition-all cursor-pointer ${
              isActive && item.id === "account"
                ? "bg-red-100 text-red-600"
                : isActive
                  ? "bg-blue-100 text-blue-600"
                  : item.id === "account"
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SettingLayout;
