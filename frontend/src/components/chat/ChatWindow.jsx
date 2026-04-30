import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import { socket } from "../../utils/socket";
import { useAuth } from "../../context/AuthContext";
import MessageInput from "./MessageInput";
import {
  MoreVertical,
  User,
  Building2,
  Mail,
  MessageCircle,
  Briefcase,
  MapPin,
  GraduationCap,
  Star,
  ChevronLeft,
} from "lucide-react";

const ChatWindow = ({ selectedUser, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (!selectedUser?._id) {
      return undefined;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${selectedUser._id}`);

        if (!isMounted) {
          return;
        }

        const messageList = res.data?.messages || res.data || [];
        setMessages(Array.isArray(messageList) ? messageList : []);

        setMessages(Array.isArray(messageList) ? messageList : []);
        setError("");
      } catch (err) {
        console.error(err);

        if (!isMounted) {
          return;
        }

        setMessages([]);
        setError(err.response?.data?.message || "Failed to load messages");
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedUser?._id]);

  const visibleMessages = selectedUser?._id ? messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleIncomingMessage = (payload) => {
      const message = payload?.message || payload;
      if (!message) return;

      const senderId =
        typeof message.sender === "string"
          ? message.sender
          : message.sender?._id;
      const receiverId =
        typeof message.receiver === "string"
          ? message.receiver
          : message.receiver?._id;

      if (
        selectedUser?._id &&
        (senderId === selectedUser._id || receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = (senderId) => {
      if (selectedUser?._id && senderId === selectedUser._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = (senderId) => {
      if (selectedUser?._id && senderId === selectedUser._id) {
        setTyping(false);
      }
    };

    socket.on("newMessage", handleIncomingMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!typing) return;

    const timeout = window.setTimeout(() => setTyping(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [typing]);

  const appendMessage = (message) => {
    setMessages((prev) => {
      if (message?._id && prev.some((item) => item._id === message._id)) {
        return prev;
      }

      return [...prev, message];
    });
  };

  const isOwnMessage = (sender) => {
    const senderId = typeof sender === "string" ? sender : sender?._id;
    return senderId === user?._id;
  };

  const formatMessageTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "recruiter":
        return <Building2 className="h-4 w-4" />;
      case "student":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "recruiter":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "student":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Messages
          </h3>
          <p className="text-gray-500 text-lg">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1  flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="md:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>

            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md">
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            {/* User Info */}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-lg flex items-center gap-1 sm:gap-2 truncate">
                <span className="truncate">{selectedUser.name}</span>
                {selectedUser.isVerified && (
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role)} flex-shrink-0`}
                >
                  {getRoleIcon(selectedUser.role)}
                  <span className="hidden sm:inline">{selectedUser.role === "recruiter" ? "Recruiter" : "Student"}</span>
                </span>
                {selectedUser.company && (
                  <span className="text-xs text-gray-500 flex items-center gap-0.5 truncate">
                    <Briefcase className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate hidden sm:inline">{selectedUser.company}</span>
                  </span>
                )}
                {selectedUser.location && (
                  <span className="text-xs text-gray-500 flex items-center gap-0.5 truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate hidden sm:inline">{selectedUser.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <Phone className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <Video className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
            </button> */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Profile Dropdown (optional) */}
        {showProfile && (
          <div className="mt-2 w-72 sm:w-80 max-h-[60vh] bg-white rounded-xl shadow-xl border border-gray-200 z-10 animate-fade-in overflow-y-auto">
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md flex-shrink-0">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {selectedUser.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                    {selectedUser.role}
                  </p>
                </div>
              </div>
              {selectedUser.email && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 min-w-0">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{selectedUser.email}</span>
                </div>
              )}
              {selectedUser.bio && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{selectedUser.bio}</p>
              )}
            </div>
            <div className="p-2 sm:p-3 space-y-1">
              <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Block User
              </button>
              <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6 space-y-2 sm:space-y-4 scrollbar-hide"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!error && visibleMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
              <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
            </div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">No messages yet</p>
            <p className="text-xs sm:text-sm text-gray-400 text-center mt-2">
              Start the conversation with{" "}
              <span className="font-semibold text-gray-500">
                {selectedUser.name?.split(" ")[0]}
              </span>
              !
            </p>
          </div>
        )}

        {!error &&
          visibleMessages.map((m, index) => {
            const isOwn = isOwnMessage(m.sender);
            const showAvatar =
              !isOwn &&
              (index === 0 ||
                isOwnMessage(visibleMessages[index - 1]?.sender) !== false);

            return (
              <div
                key={m._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end gap-1 sm:gap-2 max-w-[90%] sm:max-w-[85%] md:max-w-[70%]`}
                >
                  {!isOwn && showAvatar && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!isOwn && !showAvatar && (
                    <div className="w-6 sm:w-8 flex-shrink-0"></div>
                  )}

                  <div className={`group relative`}>
                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm ${
                        isOwn
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                      }`}
                    >
                      <p className="text-xs sm:text-sm break-words">{m.text}</p>
                    </div>
                    <div
                      className={`text-xs text-gray-400 mt-1 ${isOwn ? "text-right" : "text-left"}`}
                    >
                      {formatMessageTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {typing && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-200 rounded-2xl px-4 py-2.5 rounded-bl-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        receiver={selectedUser._id}
        onSent={appendMessage}
        disabled={!!error}
      />
    </div>
  );
};

export default ChatWindow;
