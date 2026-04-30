import React from "react";

const Toggle = ({ value, onChange }) => {
  return (
    <div
      onClick={onChange}
      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
        value ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
          value ? "translate-x-5" : ""
        }`}
      />
    </div>
  );
};

export default Toggle;
