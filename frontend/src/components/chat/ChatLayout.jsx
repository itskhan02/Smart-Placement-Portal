import React, { useMemo, useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const ChatLayout = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get("user");

  const activeUserId = useMemo(
    () => selectedUser?._id || selectedUserId || null,
    [selectedUser, selectedUserId],
  );

  return (
    <div className="h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="flex h-full transition-all duration-300">
        {/* Chat List */}
        <div
          className={`${
            activeUserId ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-1/4 flex-col bg-white border-r border-gray-200 min-w-0`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                  Messages
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm truncate">
                  Connect with recruiters
                </p>
              </div>
            </div>
          </div>

          <ChatList selectedUserId={activeUserId} onSelect={setSelectedUser} />
        </div>

        {/* Chat Window */}
        <div className={`${activeUserId ? "flex" : "hidden md:flex"} flex-1`}>
          <ChatWindow
            selectedUser={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
