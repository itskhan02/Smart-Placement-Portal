import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import {
  Mail,
  MessageCircleWarning,
  Trash2,
  User,
  AlertTriangle,
  X,
  Send,
  Shield,
  AlertCircle,
  Ban,
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Delete confirmation popup state
  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    userEmail: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (user) => {
    setDeletePopup({
      isOpen: true,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
    });
  };

  const handleConfirmDelete = async () => {
    const { userId } = deletePopup;
    if (!userId) return;

    try {
      setDeletingId(userId);
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setDeletePopup({
        isOpen: false,
        userId: null,
        userName: "",
        userEmail: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      alert("Warning message is required");
      return;
    }

    try {
      setSending(true);
      await api.post("/admin/warn", {
        userId: selectedUserId,
        message: warningMessage,
      });

      alert("Warning sent successfully!");
      setShowWarnModal(false);
      setWarningMessage("");
      setSelectedUserId(null);
      setSelectedUserName("");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to send warning");
    } finally {
      setSending(false);
    }
  };

  const openWarnModal = (user) => {
    setSelectedUserId(user._id);
    setSelectedUserName(user.name);
    setWarningMessage("");
    setShowWarnModal(true);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "recruiter":
        return "bg-blue-100 text-blue-700";
      case "student":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 text-base mt-2">
            Manage users - View, send warnings, or remove users from the
            platform
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-blue-600 text-sm font-medium">Total Users</p>
            <p className="text-2xl font-bold text-blue-900">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-green-600 text-sm font-medium">Students</p>
            <p className="text-2xl font-bold text-green-900">
              {users.filter((u) => u.role === "student").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <p className="text-purple-600 text-sm font-medium">Recruiters</p>
            <p className="text-2xl font-bold text-purple-900">
              {users.filter((u) => u.role === "recruiter").length}
            </p>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-lg text-gray-900 capitalize">
                        {user.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="flex items-center  content-center gap-2 text-gray-600 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => openWarnModal(user)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-200 font-medium text-sm border border-amber-200 hover:scale-105 active:scale-95"
                  >
                    <MessageCircleWarning size={16} />
                    Send Warning
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    disabled={deletingId === user._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium text-sm border border-red-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === user._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <User size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* delete  Popup */}
      {deletePopup.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[420px] max-w-[90vw] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Delete User
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDeletePopup({
                    isOpen: false,
                    userId: null,
                    userName: "",
                    userEmail: "",
                  })
                }
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-start gap-3">
                  <Ban
                    size={20}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-red-700 text-sm">
                      Permanent Deletion
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      This user will be permanently removed from the system. All
                      their data, including jobs, applications, and activity
                      logs will be deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* user info */}
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                    {deletePopup.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">User to be deleted</p>
                    <p className="font-semibold text-gray-900 text-base">
                      {deletePopup.userName}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail size={12} />
                      {deletePopup.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-600">"DELETE"</span> to confirm
                </label>
                <input
                  type="text"
                  placeholder="Enter DELETE"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  id="confirmDeleteInput"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value === "DELETE") {
                      handleConfirmDelete();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() =>
                  setDeletePopup({
                    isOpen: false,
                    userId: null,
                    userName: "",
                    userEmail: "",
                  })
                }
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId === deletePopup.userId}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                id="confirmDeleteBtn"
              >
                {deletingId === deletePopup.userId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* popup */}
      {showWarnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[480px] max-w-[90vw] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Send Warning
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Issue an official warning to this user
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWarnModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {selectedUserName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Warning Recipient
                    </p>
                    <p className="text-sm text-gray-600">{selectedUserName}</p>
                  </div>
                </div>
              </div>

              {/* warning message */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Warning Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter warning message..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  rows={5}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  This warning will be sent as a notification to the user
                </p>
              </div>

              {/* warning  */}
              <div className="mb-5 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-2">
                  <Shield
                    size={16}
                    className="text-amber-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Preview
                    </p>
                    <p className="text-sm text-amber-800 mt-1">
                      {warningMessage ||
                        "Your warning message will appear here..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowWarnModal(false)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWarning}
                disabled={sending || !warningMessage.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Warning
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUsers;
