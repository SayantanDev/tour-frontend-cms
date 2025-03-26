import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ Element }) => {
  const token = useSelector((state) => state.tokens.tokens.token);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return <Element />;
};

export default ProtectedRoute;
