import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  LogOut,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    properties: 0,
    agents: 0,
    messages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const agent = JSON.parse(localStorage.getItem("rentoAgent") || "null");

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("rentoToken");

      const response = await fetch(`${API_BASE_URL}/api/admin/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load admin overview.");
      }

      setStats({
        properties: data.stats?.properties || 0,
        agents: data.stats?.agents || 0,
        messages: data.stats?.messages || 0,
      });
    } catch (error) {
      console.error("Admin overview error:", error);

      setError(error.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rentoToken");
    localStorage.removeItem("rentoAgent");

    window.location.href = "/agent/login";
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        {/* HEADER */}
        <header className="admin-header">
          <div>
            <div className="admin-badge">
              <ShieldCheck size={15} />
              ADMIN CONTROL CENTER
            </div>

            <h1>
              Welcome back, <span>{agent?.fullName || "Administrator"}</span>
            </h1>

            <p>Manage the RENTO marketplace from one secure control center.</p>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div className="admin-dashboard-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="admin-stats">
          {/* PROPERTIES */}
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Building2 size={22} />
            </div>

            <div>
              <span>Total Properties</span>

              <strong>{loading ? "..." : stats.properties}</strong>
            </div>
          </div>

          {/* AGENTS */}
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Registered Agents</span>

              <strong>{loading ? "..." : stats.agents}</strong>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <MessageSquare size={22} />
            </div>

            <div>
              <span>Total Messages</span>

              <strong>{loading ? "..." : stats.messages}</strong>
            </div>
          </div>
        </section>

        {/* MANAGEMENT */}
        <section className="admin-management">
          <div className="admin-section-heading">
            <div>
              <span>CONTROL CENTER</span>

              <h2>Manage RENTO</h2>
            </div>

            <button
              type="button"
              className="admin-dashboard-refresh"
              onClick={fetchOverview}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? "admin-refresh-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="admin-management-grid">
            {/* PROPERTIES */}
            <Link to="/admin/properties" className="admin-management-card">
              <div className="admin-management-icon">
                <Building2 size={25} />
              </div>

              <div>
                <h3>Properties</h3>

                <p>View, edit and remove any property listed on RENTO.</p>
              </div>

              <ArrowUpRight size={19} />
            </Link>

            {/* AGENTS */}
            <Link to="/admin/agents" className="admin-management-card">
              <div className="admin-management-icon">
                <Users size={25} />
              </div>

              <div>
                <h3>Agents</h3>

                <p>View and manage registered property agents.</p>
              </div>

              <ArrowUpRight size={19} />
            </Link>

            {/* MESSAGES */}
            <Link to="/admin/messages" className="admin-management-card">
              <div className="admin-management-icon">
                <MessageSquare size={25} />
              </div>

              <div>
                <h3>Messages</h3>

                <p>View inquiries sent through RENTO.</p>
              </div>

              <ArrowUpRight size={19} />
            </Link>
          </div>
        </section>

        {/* SECURITY */}
        <section className="admin-security-card">
          <div className="admin-security-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h3>Private Administrator Area</h3>

            <p>
              This area is restricted to RENTO administrators. Normal visitors
              and agents cannot access administrative controls.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
