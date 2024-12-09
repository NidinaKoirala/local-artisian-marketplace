import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ allowedRoles, userRole, children }) => {
  console.log("Checking PrivateRoute:");
  console.log("Allowed Roles:", allowedRoles); // Debug log
  console.log("User Role:", userRole); // Debug log

  if (!allowedRoles.includes(userRole)) {
    console.error("Access Denied: User role is not authorized.");
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default PrivateRoute;
