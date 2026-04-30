import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import api from "../../utils/api"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AccountSetting = () => {
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const navigate = useNavigate();

  const handleDeactivate = async () => {
    try {
      await api.put("/users/deactivate");

      toast.success("Account deactivated");

      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to deactivate account");
    } finally {
      setShowDeactivate(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete("/users/delete"); 
      toast.success("Account deleted permanently");

      localStorage.removeItem("token");
      navigate("/register");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="flex text-2xl text-red-500 font-semibold items-center gap-2">
          <AlertTriangle size={24} />
          Manage Your Account
        </h1>
        <p className="text-base text-gray-500 mt-2">
          These actions are irreversible. Please be careful.
        </p>
      </div>

      {/* deactivate */}
      <div className="flex items-center justify-between rounded-lg border border-red-300 p-4">
        <div>
          <p className="font-medium">Deactivate Account</p>
          <p className="text-sm text-gray-500">
            Temporarily disable your account. You can reactivate anytime.
          </p>
        </div>

        <button
          onClick={() => setShowDeactivate(true)}
          className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100"
        >
          Deactivate
        </button>
      </div>

      {/* delete */}
      <div className="flex items-center justify-between rounded-lg border border-red-300 p-4">
        <div>
          <p className="font-medium text-red-500">Delete Account</p>
          <p className="text-sm text-gray-500">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <button
          onClick={() => setShowDelete(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* deactivate popup */}
      {showDeactivate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Deactivate your account?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Your profile will be hidden and you’ll be logged out.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeactivate(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDeactivate}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete popup */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-red-500 mb-2">
              This is permanent
            </h2>

            <p className="text-sm text-gray-500 mb-3">
              All your data will be deleted permanently.
              <br />
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm.
            </p>

            <input
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE"}
                className={`px-4 py-2 rounded-lg text-white ${
                  deleteConfirm === "DELETE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSetting;
