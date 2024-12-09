import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles, userRole }) => {
  // Check if the user's role is allowed to access the route
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  // Render the children if the user is authorized
  return children;
};

export default PrivateRoute;