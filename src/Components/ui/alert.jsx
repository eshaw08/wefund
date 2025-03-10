import React from "react";

const Alert = ({ message, type = "info" }) => {
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-700";
      case "error":
        return "bg-red-100 border-red-500 text-red-700";
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      default:
        return "bg-blue-100 border-blue-500 text-blue-700";
    }
  };

  return (
    <div className={`border-l-4 p-4 ${getBgColor()} rounded-md`} role="alert">
      <p className="font-bold">{type.toUpperCase()}</p>
      <p>{message}</p>
    </div>
  );
};

export default Alert;
