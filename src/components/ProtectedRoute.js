import React from "react";
import { Navigate } from "react-router-dom";
import usePermissions from "../hooks/UsePermissions";

const ProtectedRoute = ({ Element, module }) => {
  const checkPermission = usePermissions();
  const hasAccess = checkPermission(module, "view"); // Check view permission

  if (!hasAccess) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Element />;
};

export default ProtectedRoute;
