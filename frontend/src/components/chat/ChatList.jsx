import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Search, User, Building2, MessageCircle, Loader2, GraduationCap, Briefcase } from "lucide-react";

const ChatList = ({ selectedUserId, onSelect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/chat/contacts");
        const contactList = res.data.contacts || [];

        setUsers(contactList);

        if (selectedUserId) {
          const matchedUser = contactList.find(
            (user) => user._id === selectedUserId,
          );
          if (matchedUser) {
            onSelect(matchedUser);
          }
        } else if (contactList.length > 0 && !selectedUserId) {
          onSelect(contactList[0]);
        }
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [onSelect, selectedUserId]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "recruiter":
        return { bg: "bg-purple-100", text: "text-purple-700", icon: <Building2 className="h-3 w-3" /> };
      case "student":
        return { bg: "bg-green-100", text: "text-green-700", icon: <GraduationCap className="h-3 w-3" /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: <User className="h-3 w-3" /> };
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-2 sm:p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs sm:text-sm shadow-sm hover:border-gray-300"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        )}
        
        {!loading && error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-gray-600 text-center font-medium mb-1">
              {searchTerm ? "No matching conversations found" : "No conversations yet"}
            </p>
            <p className="text-xs text-gray-400 text-center">
              {searchTerm ? "Try a different search term" : "Start connecting with recruiters"}
            </p>
          </div>
        )}

        {!loading && !error && filteredUsers.map((u) => {
          const roleStyle = getRoleBadge(u.role);
          return (
            <div
              key={u._id}
              onClick={() => onSelect(u)}
              className={`group relative mx-1 sm:mx-2 mb-1 sm:mb-2 p-2 sm:p-3.5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                selectedUserId === u._id
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md"
                  : "hover:bg-gray-50 border-2 border-transparent hover:border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">

                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg ${
                    selectedUserId === u._id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gradient-to-r from-gray-500 to-gray-600"
                  }`}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 gap-1">
                    <h3 className="font-semibold text-gray-900 truncate text-xs sm:text-sm">
                      {u.name}
                    </h3>
                    {u.lastMessageTime && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{u.lastMessageTime}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text} flex-shrink-0`}>
                      {roleStyle.icon}
                      <span className="capitalize hidden sm:inline">{u.role || "User"}</span>
                    </span>
                    {u.company && (
                      <span className="text-xs text-gray-500 truncate flex items-center gap-0.5">
                        <Briefcase className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{u.company}</span>
                      </span>
                    )}
                  </div>
                  {u.lastMessage && (
                    <p className="text-xs text-gray-400 truncate">
                      {u.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
