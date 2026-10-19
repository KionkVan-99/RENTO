import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const token = localStorage.getItem("rentoToken");
  const agentData = localStorage.getItem("rentoAgent");

  if (!token || !agentData) {
    return <Navigate to="/agent/login" replace />;
  }

  let agent;

  try {
    agent = JSON.parse(agentData);
  } catch (error) {
    localStorage.removeItem("rentoToken");
    localStorage.removeItem("rentoAgent");

    return <Navigate to="/agent/login" replace />;
  }

  if (agent.role !== "admin") {
    return <Navigate to="/agent" replace />;
  }

  return <Outlet context={{ agent }} />;
}

export default ProtectedAdminRoute;