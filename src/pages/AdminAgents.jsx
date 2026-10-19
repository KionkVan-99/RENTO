import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Users,
  RefreshCw,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://rento-api-rime.onrender.com";

function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("rentoToken");
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/agents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load registered agents."
        );
      }

      setAgents(data.agents || []);
    } catch (error) {
      console.error(
        "Admin agents error:",
        error
      );

      setError(
        error.message ||
          "Failed to load registered agents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const getProfileImage = (profileImage) => {
    if (!profileImage) {
      return null;
    }

    if (
      profileImage.startsWith("http://") ||
      profileImage.startsWith("https://")
    ) {
      return profileImage;
    }

    if (profileImage.startsWith("/")) {
      return `${API_BASE_URL}${profileImage}`;
    }

    return `${API_BASE_URL}/${profileImage}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="admin-agents-page">

      {/* HEADER */}
      <header className="admin-agents-header">
        <div className="admin-agents-header-inner">

          <Link
            to="/admin"
            className="admin-back-link"
          >
            <ArrowLeft size={17} />
            Admin Center
          </Link>

          <div className="admin-agents-title">

            <div className="admin-agents-badge">
              <ShieldCheck size={14} />
              ADMIN ONLY
            </div>

            <h1>
              Agent Management
            </h1>

            <p>
              View the people who have registered
              as property agents on RENTO.
            </p>

          </div>

          <button
            type="button"
            className="admin-agents-refresh"
            onClick={fetchAgents}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "admin-refresh-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>
      </header>

      {/* MAIN */}
      <main className="admin-agents-container">

        {/* SUMMARY */}
        <div className="admin-agents-summary">

          <div className="admin-agents-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>
              REGISTERED AGENTS
            </span>

            <strong>
              {loading
                ? "—"
                : agents.length}
            </strong>
          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="admin-agents-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="admin-agents-loading">

            <RefreshCw
              size={26}
              className="admin-refresh-spin"
            />

            <p>
              Loading registered agents...
            </p>

          </div>
        ) : agents.length === 0 ? (

          /* EMPTY */
          <div className="admin-agents-empty">

            <UserRound size={42} />

            <h2>
              No registered agents
            </h2>

            <p>
              No normal agent accounts have
              been registered yet.
            </p>

          </div>

        ) : (

          /* AGENTS */
          <div className="admin-agents-grid">

            {agents.map((agent) => {

              const imageUrl =
                getProfileImage(
                  agent.profileImage
                );

              return (
                <article
                  className="admin-agent-card"
                  key={agent.id}
                >

                  {/* PROFILE */}
                  <div className="admin-agent-profile">

                    <div className="admin-agent-avatar">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={agent.fullName}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <UserRound
                          size={30}
                        />
                      )}

                    </div>

                    <div className="admin-agent-identity">

                      <span className="admin-agent-role">
                        PROPERTY AGENT
                      </span>

                      <h2>
                        {agent.fullName}
                      </h2>

                      {agent.agencyName && (
                        <p>
                          <Building2 size={14} />
                          {agent.agencyName}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* CONTACT */}
                  <div className="admin-agent-contact">

                    <div className="admin-agent-contact-item">

                      <Mail size={15} />

                      <div>
                        <span>
                          EMAIL
                        </span>

                        <strong>
                          {agent.email}
                        </strong>
                      </div>

                    </div>

                    <div className="admin-agent-contact-item">

                      <Phone size={15} />

                      <div>
                        <span>
                          PHONE
                        </span>

                        <strong>
                          {agent.phone ||
                            "Not provided"}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="admin-agent-footer">

                    <div>
                      <span>
                        REGISTERED
                      </span>

                      <strong>
                        <CalendarDays
                          size={13}
                        />

                        {formatDate(
                          agent.createdAt
                        )}
                      </strong>
                    </div>

                    <div className="admin-agent-status">
                      <span></span>
                      Active Agent
                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
}

export default AdminAgents;