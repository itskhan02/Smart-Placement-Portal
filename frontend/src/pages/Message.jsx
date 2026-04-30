import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import ChatLayout from "../components/chat/ChatLayout";
import { MessageCircle} from "lucide-react";

const Message = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Layout role={user.role}>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10"></div>
        {/* <div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md">
            <div className="p-2 bg-white/20 rounded-xl shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              <p className="text-white/90 mt-1">
                Connect with recruiters and get hired faster
              </p>
            </div>
          </div>
        </div> */}

        <ChatLayout />
      </div>
    </Layout>
  );
};

export default Message;
