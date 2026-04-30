import { useState } from "react";
import { toast } from "react-hot-toast";

const Security = ({ changePassword, logoutAll }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success("Password updated successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      {/* 🔐 PASSWORD */}
      <div>
        <h3 className="text-lg font-semibold mb-1">🔐 Change Password</h3>
        <p className="text-sm text-gray-500 mb-4">
          Use a strong password you don’t reuse elsewhere
        </p>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t" />

      {/* 🔐 PRIVACY */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy & Sessions</h3>

        {/* 2FA */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">
              Add an extra layer of security
            </p>
          </div>

          <button
            onClick={() => setTwoFA(!twoFA)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              twoFA ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                twoFA ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        <div className="border-t mb-4" />

        {/* LOGIN ALERTS */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-medium">Login Alerts</p>
            <p className="text-sm text-gray-500">
              Get notified about new sign-ins
            </p>
          </div>

          <button
            onClick={() => setLoginAlerts(!loginAlerts)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              loginAlerts ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                loginAlerts ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        <div className="border-t mb-4" />

        {/* LOGOUT ALL */}
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Logout from all devices</p>
            <p className="text-sm text-gray-500">
              End all active sessions everywhere
            </p>
          </div>

          <button
            onClick={logoutAll}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Sign out everywhere
          </button>
        </div>
      </div>
    </div>
  );
};

export default Security;
