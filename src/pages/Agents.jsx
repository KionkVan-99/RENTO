import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/agents`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load agents.");
        }

        setAgents(data.agents || []);
      } catch (err) {
        console.error("Agents loading error:", err);
        setError(err.message || "Unable to load agents.");
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const getProfileImage = (profileImage) => {
    if (!profileImage) return null;

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

  return (
    <main className="agents-page">
      {/* HERO */}
      <section className="agents-hero">
        <div className="agents-hero-glow agents-hero-glow-one"></div>
        <div className="agents-hero-glow agents-hero-glow-two"></div>

        <div className="agents-container">
          <div className="agents-hero-content">
            <div className="agents-eyebrow">
              <span></span>
              RENTO AGENT NETWORK
            </div>

            <h1>
              Meet the people
              <br />
              <em>behind the listings.</em>
            </h1>

            <p>
              Connect with verified property agents and explore the homes,
              apartments and land they have listed on RENTO.
            </p>

            <div className="agents-hero-stats">
              <div>
                <strong>{agents.length}</strong>
                <span>Registered Agents</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Professional Profiles</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Property Discovery</span>
              </div>
            </div>
          </div>

          <div className="agents-hero-visual">
            <div className="agents-hero-circle">
              <Users size={90} strokeWidth={1} />
            </div>

            <div className="agents-floating-card agents-floating-card-one">
              <ShieldCheck size={17} />
              <div>
                <strong>Verified</strong>
                <span>Agent profiles</span>
              </div>
            </div>

            <div className="agents-floating-card agents-floating-card-two">
              <Building2 size={17} />
              <div>
                <strong>Properties</strong>
                <span>Listed on RENTO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="agents-directory">
        <div className="agents-container">
          <div className="agents-section-heading">
            <div>
              <span className="agents-section-label">OUR NETWORK</span>
              <h2>Find your agent.</h2>
            </div>

            <p>
              Browse our registered agents and discover the properties they
              currently represent.
            </p>
          </div>

          {loading && (
            <div className="agents-state">
              <LoaderCircle className="agents-spinner" size={34} />
              <p>Loading agents...</p>
            </div>
          )}

          {!loading && error && (
            <div className="agents-state agents-error-state">
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && agents.length === 0 && (
            <div className="agents-state">
              <Users size={42} strokeWidth={1.3} />
              <h3>No agents yet</h3>
              <p>Registered property agents will appear here.</p>
            </div>
          )}

          {!loading && !error && agents.length > 0 && (
            <div className="agents-grid">
              {agents.map((agent, index) => {
                const imageUrl = getProfileImage(agent.profileImage);

                return (
                  <article
                    className="agent-card"
                    key={agent.id}
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                  >
                    <div className="agent-card-image">
                      {imageUrl ? (
                        <img src={imageUrl} alt={agent.fullName} />
                      ) : (
                        <div className="agent-card-placeholder">
                          {agent.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                      )}

                      <div className="agent-verified-badge">
                        <ShieldCheck size={14} />
                        Verified
                      </div>
                    </div>

                    <div className="agent-card-content">
                      <span className="agent-card-role">PROPERTY AGENT</span>

                      <h3>{agent.fullName}</h3>

                      <div className="agent-agency">
                        <Building2 size={15} />
                        <span>{agent.agencyName || "Independent Agent"}</span>
                      </div>

                      <div className="agent-card-divider"></div>

                      <Link
                        to={`/agents/${agent.id}`}
                        className="agent-profile-link"
                      >
                        View Agent Profile
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="agents-cta">
        <div className="agents-container">
          <div className="agents-cta-inner">
            <div>
              <span className="agents-section-label">WANT TO JOIN RENTO?</span>

              <h2>
                Turn your property
                <br />
                network into <em>opportunity.</em>
              </h2>
            </div>

            <Link to="/agent/register" className="agents-cta-button">
              Become an Agent
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Agents;
