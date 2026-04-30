import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const Notification = ({ onMarkRead }) => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get("/notification");
      setData(res.data.notifications);
    } catch (err) {
      console.log(err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const handleClick = async (n) => {
  try {
    if (!n.isRead) {
      await api.put(`/notification/${n._id}/read`);

      setData((prev) =>
        prev.map((item) =>
          item._id === n._id ? { ...item, isRead: true } : item,
        ),
      );

      if (onMarkRead) onMarkRead();
    }

    if (n.link) navigate(n.link);
  } catch (err) {
    console.log(err);
  }
};

  return (
    <>
      <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl p-3 z-50">
        <h3 className="font-semibold mb-2">Notifications</h3>

        {data.length === 0 ? (
          <p>No notifications</p>
        ) : (
          data.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              className={`p-2 mb-2 rounded cursor-pointer ${
                n.type === "ADMIN_WARNING"
                  ? "bg-red-100 border border-red-300"
                  : n.isRead
                    ? "bg-gray-100"
                    : "bg-blue-100"
              }`}
            >
              {n.type === "ADMIN_WARNING" ? (
                <>
                  <p className="font-semibold text-red-700">⚠️ Admin Warning</p>
                  <p className="text-sm text-red-600">{n.message}</p>
                </>
              ) : (
                <>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm">{n.message}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Notification;
