import React from "react";
import Toggle from "./Toggle";

const NotificationSettings = ({
  settings,
  updateSettingsField,
  role = "student",
}) => {
  if (!settings) return null;

  const notifications = settings.notifications || {};

  const inApp = {
    applicants: notifications.inApp?.applicants ?? false,
    messages: notifications.inApp?.messages ?? false,
    jobAlerts: notifications.inApp?.jobAlerts ?? false,
    system: notifications.inApp?.system ?? false,
  };

  const email = {
    enabled: notifications.email?.enabled ?? false,
    applications: notifications.email?.applications ?? false,
    interviews: notifications.email?.interviews ?? false,
  };



  const studentInAppLabels = {
    applicants: "Application Status Updates",
    messages: "Messages from Recruiters",
    jobAlerts: "New Job Matches",
    system: "System Alerts",
  };

  

  const recruiterInAppLabels = {
    applicants: "New Applicants",
    messages: "Candidate Messages",
    jobAlerts: "Job Activity Alerts",
    system: "System Alerts",
  };

  const studentEmailLabels = {
    applications: "Application Emails",
    interviews: "Interview Invites",
  };

  const recruiterEmailLabels = {
    applications: "Applicant Emails",
    interviews: "Interview Scheduling Emails",
  };


  const inAppLabels =
    role === "recruiter" ? recruiterInAppLabels : studentInAppLabels;

  const emailLabels =
    role === "recruiter" ? recruiterEmailLabels : studentEmailLabels;

  const toggleInApp = (key) => {
    updateSettingsField(`notifications.inApp.${key}`, !inApp[key]);
  };

  const toggleEmail = (key) => {
    updateSettingsField(`notifications.email.${key}`, !email[key]);
  };

  const toggleEmailMaster = () => {
    updateSettingsField("notifications.email.enabled", !email.enabled);
  };

  return (
    <div className="space-y-6">
      {/* in app */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">In-App Notifications</h3>

        {Object.entries(inAppLabels).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b last:border-none"
          >
            <span className="font-medium text-gray-700">{label}</span>

            <Toggle value={inApp[key]} onChange={() => toggleInApp(key)} />
          </div>
        ))}
      </div>

      {/* email */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Email Notifications</h3>
            <p className="text-sm text-gray-500">
              Enable or disable all emails
            </p>
          </div>

          <Toggle value={email.enabled} onChange={toggleEmailMaster} />
        </div>

        <div
          className={`space-y-2 ${
            !email.enabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {Object.entries(emailLabels).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b last:border-none"
            >
              <span className="font-medium text-gray-700">{label}</span>

              <Toggle value={email[key]} onChange={() => toggleEmail(key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
