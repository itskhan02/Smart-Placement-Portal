import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
    brown: "bg-amber-600",
  };

  return (
    <div className="w-full p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div
          className={`p-2.5 rounded-xl ${colorClasses[color]} text-white shadow-sm`}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>{Math.abs(trend)}% this week</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
