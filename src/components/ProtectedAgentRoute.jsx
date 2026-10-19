import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedAgentRoute() {
  const token = localStorage.getItem("rentoToken");
  const agentData = localStorage.getItem("rentoAgent");

  // Not logged in
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

  // Admin accounts cannot enter the agent area
  if (agent.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Only actual agents can enter
  if (agent.role !== "agent") {
    localStorage.removeItem("rentoToken");
    localStorage.removeItem("rentoAgent");

    return <Navigate to="/agent/login" replace />;
  }

  return <Outlet context={{ agent }} />;
}

export default ProtectedAgentRoute;
