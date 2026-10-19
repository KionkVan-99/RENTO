import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Bath,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Home,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Maximize,
  ShieldCheck,
  UnlockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const AgentPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // SECURITY STATE
  // ==============================

  const [currentAgent, setCurrentAgent] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [profileLocked, setProfileLocked] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // ==============================
  // LOAD CURRENT LOGGED-IN AGENT
  // ==============================

  useEffect(() => {
    const savedAgent = localStorage.getItem("rentoAgent");

    if (!savedAgent) {
      setCurrentAgent(null);
      return;
    }

    try {
      const parsedAgent = JSON.parse(savedAgent);
      setCurrentAgent(parsedAgent);
    } catch (error) {
      console.error("Could not read logged-in agent:", error);

      localStorage.removeItem("rentoAgent");
      setCurrentAgent(null);
    }
  }, []);

  // ==============================
  // LOAD PUBLIC AGENT
  // ==============================

  useEffect(() => {
    const loadAgent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/agents/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load agent profile.");
        }

        setAgent(data.agent);
        setProperties(data.properties || []);
      } catch (err) {
        console.error("Agent profile error:", err);

        setError(err.message || "Unable to load agent profile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAgent();
    }
  }, [id]);

  // ==============================
  // DETECT OWNER
  // ==============================

  useEffect(() => {
    if (!agent || !currentAgent) {
      setIsOwner(false);
      setProfileLocked(false);
      return;
    }

    const owner = Number(currentAgent.id) === Number(agent.id);

    setIsOwner(owner);

    if (owner) {
      setProfileLocked(true);
    } else {
      setProfileLocked(false);
    }
  }, [agent, currentAgent]);

  // ==============================
  // PROFILE IMAGE
  // ==============================

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

  // ==============================
  // PROPERTY IMAGE
  // ==============================

  const getPropertyImage = (images) => {
    if (!images || images.length === 0) {
      return null;
    }

    const firstImage = images[0];

    if (firstImage.startsWith("http://") || firstImage.startsWith("https://")) {
      return firstImage;
    }

    if (firstImage.startsWith("/")) {
      return `${API_BASE_URL}${firstImage}`;
    }

    return `${API_BASE_URL}/${firstImage}`;
  };

  // ==============================
  // FORMAT PRICE
  // ==============================

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (date) => {
    if (!date) return "Recently joined";

    return new Date(date).toLocaleDateString("en-NG", {
      month: "long",
      year: "numeric",
    });
  };

  // ==============================
  // VERIFY PASSWORD
  // ==============================

  const handleProfileUnlock = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setVerificationError("Enter your password to continue.");
      return;
    }

    const token = localStorage.getItem("rentoToken");

    if (!token) {
      setVerificationError(
        "Your login session has expired. Please log in again.",
      );
      return;
    }

    try {
      setVerifying(true);
      setVerificationError("");

      const verifyResponse = await fetch(
        `${API_BASE_URL}/api/auth/verify-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password,
          }),
        },
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Profile verification failed.");
      }

      const unlockToken = verifyData.unlockToken;

      if (!unlockToken) {
        throw new Error("Profile unlock token was not returned.");
      }

      // Save only for this browser session.
      sessionStorage.setItem("rentoProfileUnlockToken", unlockToken);

      sessionStorage.setItem("rentoPrivateAgentId", String(id));

      // Go to the separate PRIVATE profile page.
      navigate(`/agent/profile/${id}`);
    } catch (error) {
      console.error("Profile verification error:", error);

      setVerificationError(
        error.message || "Unable to verify your profile access.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <main className="agent-profile-page">
        <div className="agent-profile-state">
          <LoaderCircle size={38} className="agent-profile-spinner" />

          <p>Loading agent profile...</p>
        </div>
      </main>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error || !agent) {
    return (
      <main className="agent-profile-page">
        <div className="agent-profile-state">
          <ShieldCheck size={46} strokeWidth={1.2} />

          <h2>Agent profile unavailable</h2>

          <p>{error || "This agent could not be found."}</p>

          <Link to="/agents" className="agent-back-button">
            <ArrowLeft size={17} />
            Back to Agents
          </Link>
        </div>
      </main>
    );
  }

  const profileImage = getProfileImage(agent.profileImage);

  // ============================================================
  // 🔐 OWNER PASSWORD SCREEN
  // ============================================================

  if (isOwner && profileLocked) {
    return (
      <main className="agent-profile-page agent-profile-locked-page">
        <section className="agent-profile-lock-section">
          <div className="agent-profile-lock-glow"></div>

          <div className="agent-profile-lock-card">
            <div className="agent-profile-lock-icon">
              <LockKeyhole size={32} strokeWidth={1.5} />
            </div>

            <span className="agent-profile-lock-label">PRIVATE PROFILE</span>

            <h1>Verify your identity.</h1>

            <p>
              This is your private RENTO agent profile. Confirm your password to
              continue to your private account area.
            </p>

            <div className="agent-profile-lock-user">
              <div className="agent-profile-lock-avatar">
                {profileImage ? (
                  <img src={profileImage} alt={agent.fullName} />
                ) : (
                  agent.fullName?.charAt(0)?.toUpperCase()
                )}
              </div>

              <div>
                <strong>{agent.fullName}</strong>

                <span>{agent.agencyName || "Independent Property Agent"}</span>
              </div>
            </div>

            <form
              className="agent-profile-lock-form"
              onSubmit={handleProfileUnlock}
            >
              <label>Account Password</label>

              <div className="agent-profile-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={verifying}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {verificationError && (
                <div className="agent-profile-lock-error">
                  {verificationError}
                </div>
              )}

              <button
                type="submit"
                className="agent-profile-unlock-button"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="agent-profile-button-spinner"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <UnlockKeyhole size={18} />
                    Continue to Private Profile
                  </>
                )}
              </button>
            </form>

            <div className="agent-profile-lock-security">
              <ShieldCheck size={17} />

              <span>
                Your password is verified securely and is never displayed or
                stored here.
              </span>
            </div>

            <Link to="/agents" className="agent-profile-lock-back">
              <ArrowLeft size={16} />
              Return to Agent Directory
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ============================================================
  // 🌍 PUBLIC PROFILE
  // ============================================================

  return (
    <main className="agent-profile-page">
      {/* HERO */}

      <section className="agent-profile-hero">
        <div className="agent-profile-glow"></div>

        <div className="agent-profile-container">
          <Link to="/agents" className="agent-profile-back">
            <ArrowLeft size={17} />
            All Agents
          </Link>

          <div className="agent-profile-hero-grid">
            {/* PHOTO */}

            <div className="agent-profile-photo-wrap">
              <div className="agent-profile-photo-large">
                {profileImage ? (
                  <img src={profileImage} alt={agent.fullName} />
                ) : (
                  <div className="agent-profile-photo-placeholder">
                    {agent.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="agent-profile-verified">
                <CheckCircle2 size={16} />
                Registered Agent
              </div>
            </div>

            {/* INFORMATION */}

            <div className="agent-profile-info">
              <span className="agent-profile-eyebrow">RENTO AGENT</span>

              <h1>{agent.fullName}</h1>

              <div className="agent-profile-agency">
                <Building2 size={18} />

                <span>{agent.agencyName || "Independent Property Agent"}</span>
              </div>

              <p className="agent-profile-description">
                Explore properties represented by{" "}
                <strong>{agent.fullName}</strong> on RENTO. Browse available
                homes, apartments, land and other property opportunities.
              </p>

              <div className="agent-profile-meta">
                <div>
                  <CalendarDays size={17} />

                  <span>On RENTO since {formatDate(agent.createdAt)}</span>
                </div>

                <div>
                  <Home size={17} />

                  <span>
                    {properties.length}{" "}
                    {properties.length === 1 ? "Property" : "Properties"} Listed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC PROPERTIES */}

      <section className="agent-profile-properties">
        <div className="agent-profile-container">
          <div className="agent-properties-heading">
            <div>
              <span className="agent-profile-section-label">
                PROPERTY PORTFOLIO
              </span>

              <h2>
                Properties by <em>{agent.fullName}</em>
              </h2>
            </div>

            <p>Explore the properties currently listed through this agent.</p>
          </div>

          {properties.length === 0 ? (
            <div className="agent-no-properties">
              <Home size={44} strokeWidth={1.2} />

              <h3>No properties listed yet</h3>

              <p>This agent has not published any properties yet.</p>
            </div>
          ) : (
            <div className="agent-properties-grid">
              {properties.map((property) => {
                const propertyImage = getPropertyImage(property.images);

                return (
                  <article className="agent-property-card" key={property.id}>
                    <Link
                      to={`/property/${property.id}`}
                      className="agent-property-image"
                    >
                      {propertyImage ? (
                        <img src={propertyImage} alt={property.title} />
                      ) : (
                        <div className="agent-property-placeholder">
                          <Home size={40} />
                        </div>
                      )}

                      <span className="agent-property-type">
                        {property.listingType === "sale"
                          ? "FOR SALE"
                          : property.listingType === "rent"
                            ? "FOR RENT"
                            : property.listingType?.toUpperCase()}
                      </span>
                    </Link>

                    <div className="agent-property-content">
                      <span className="agent-property-category">
                        {property.type}
                      </span>

                      <h3>{property.title}</h3>

                      <div className="agent-property-location">
                        <MapPin size={15} />

                        <span>{property.location}</span>
                      </div>

                      <strong className="agent-property-price">
                        {formatPrice(property.price)}
                      </strong>

                      <div className="agent-property-details">
                        {property.bedrooms !== null &&
                          property.bedrooms !== undefined && (
                            <span>
                              <BedDouble size={16} />
                              {property.bedrooms}
                            </span>
                          )}

                        {property.bathrooms !== null &&
                          property.bathrooms !== undefined && (
                            <span>
                              <Bath size={16} />
                              {property.bathrooms}
                            </span>
                          )}

                        {property.parkingSpaces !== null &&
                          property.parkingSpaces !== undefined && (
                            <span>
                              <Car size={16} />
                              {property.parkingSpaces}
                            </span>
                          )}

                        {property.area && (
                          <span>
                            <Maximize size={16} />
                            {property.area} m²
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/property/${property.id}`}
                        className="agent-property-button"
                      >
                        View Property
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

      {/* CTA */}

      <section className="agent-profile-cta">
        <div className="agent-profile-container">
          <div className="agent-profile-cta-inner">
            <div>
              <span className="agent-profile-section-label">
                LOOKING FOR PROPERTY?
              </span>

              <h2>
                Find something
                <br />
                <em>worth coming home to.</em>
              </h2>
            </div>

            <Link to="/buy" className="agent-profile-cta-button">
              Explore Properties
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AgentPublicProfile;
