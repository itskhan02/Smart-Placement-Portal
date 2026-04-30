import React, { useEffect, useRef, useState } from "react";
import api from "../../utils/api";
import { socket } from "../../utils/socket";
import { useAuth } from "../../context/AuthContext";
import { Send } from "lucide-react";

const MessageInput = ({ receiver, onSent, disabled = false }) => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!text.trim() || disabled) return;

    try {
      const trimmedText = text.trim();
      const res = await api.post("/chat", {
        receiver,
        text: trimmedText,
      });

      onSent?.(res.data);

      if (user?._id) {
        socket.emit("stopTyping", {
          sender: user._id,
          receiver,
        });
      }

      setText("");
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (value) => {
    const trimmedText = value.trim();

    if (!trimmedText) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        setIsTyping(false);
        if (user?._id) {
          socket.emit("stopTyping", {
            sender: user._id,
            receiver,
          });
        }
      }

      return;
    }

    if (!isTyping && user?._id) {
      setIsTyping(true);
      socket.emit("typing", { sender: user._id, receiver });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (user?._id) {
        socket.emit("stopTyping", {
          sender: user._id,
          receiver,
        });
      }
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-2 sm:p-4 shadow-lg bg-gradient-to-t from-white to-gray-50">
      <div className="flex items-end gap-2 sm:gap-3">
        {/* <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Paperclip className="h-5 w-5" />
        </button>

        <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Smile className="h-5 w-5" />
        </button> */}

        <div className="flex-1 relative flex items-center min-w-0">
          <textarea
            value={text}
            onChange={(e) => {
              const nextValue = e.target.value;
              setText(nextValue);
              handleTyping(nextValue);
            }}
            onKeyDown={handleKeyPress}
            placeholder={
              disabled ? "Messaging unavailable" : "Type a message..."
            }
            disabled={disabled}
            rows="1"
            className="w-full px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-xs sm:text-sm shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
            style={{ maxHeight: "120px" }}
          />
        </div>
        {/* <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Mic className="h-5 w-5" />
        </button> */}

        <button
          onClick={sendMessage}
          disabled={!text.trim() || disabled}
          className={`flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm ${
            !text.trim() || disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105 active:scale-95"
          }`}
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
