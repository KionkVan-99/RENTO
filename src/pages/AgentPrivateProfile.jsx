import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Home,
  LoaderCircle,
  Mail,
  MapPin,
  Maximize,
  Phone,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const API_BASE_URL = "https://rento-api-rime.onrender.come.onrender.come.onrender.come.onrender.com";

const AgentPrivateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // LOAD PRIVATE PROFILE
  // ==============================

  useEffect(() => {
    const loadPrivateProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("rentoToken");

        const unlockToken = sessionStorage.getItem(
          "rentoProfileUnlockToken"
        );

        const privateAgentId =
          sessionStorage.getItem(
            "rentoPrivateAgentId"
          );

        if (!token) {
          throw new Error(
            "Your login session has expired. Please log in again."
          );
        }

        if (!unlockToken) {
          throw new Error(
            "Private profile access has expired. Please verify your password again."
          );
        }

        if (
          privateAgentId &&
          Number(privateAgentId) !== Number(id)
        ) {
          throw new Error(
            "Invalid private profile session."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/agents/${id}/private`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Profile-Unlock": unlockToken,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load your private profile."
          );
        }

        setAgent(data.agent);
        setProperties(data.properties || []);
      } catch (err) {
        console.error(
          "Private profile error:",
          err
        );

        // If the short-lived unlock token
        // expired, remove it.
        if (
          err.message?.toLowerCase().includes("expired") ||
          err.message
            ?.toLowerCase()
            .includes("unlock")
        ) {
          sessionStorage.removeItem(
            "rentoProfileUnlockToken"
          );

          sessionStorage.removeItem(
            "rentoPrivateAgentId"
          );
        }

        setError(
          err.message ||
            "Unable to load your private profile."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPrivateProfile();
    }
  }, [id]);

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

    if (
      firstImage.startsWith("http://") ||
      firstImage.startsWith("https://")
    ) {
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

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  // ==============================
  // LEAVE PRIVATE PROFILE
  // ==============================

  const handleLeavePrivateProfile = () => {
    sessionStorage.removeItem(
      "rentoProfileUnlockToken"
    );

    sessionStorage.removeItem(
      "rentoPrivateAgentId"
    );

    navigate("/agents");
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <main className="agent-profile-page">
        <div className="agent-profile-state">
          <LoaderCircle
            size={38}
            className="agent-profile-spinner"
          />

          <p>
            Loading your private profile...
          </p>
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
          <ShieldCheck
            size={46}
            strokeWidth={1.2}
          />

          <h2>Private profile unavailable</h2>

          <p>
            {error ||
              "Your private profile could not be loaded."}
          </p>

          <button
            type="button"
            className="agent-back-button"
            onClick={() => navigate(`/agents/${id}`)}
          >
            <ArrowLeft size={17} />
            Verify Again
          </button>
        </div>
      </main>
    );
  }

  const profileImage = getProfileImage(
    agent.profileImage
  );

  // ==============================
  // PRIVATE PROFILE
  // ==============================

  return (
    <main className="agent-profile-page agent-private-profile">
      {/* =========================================
          PRIVATE HERO
      ========================================= */}

      <section className="agent-private-hero">
        <div className="agent-profile-container">
          <div className="agent-private-topbar">
            <Link
              to="/agent"
              className="agent-profile-back"
            >
              <ArrowLeft size={17} />
              Agent Dashboard
            </Link>

            <button
              type="button"
              className="agent-private-exit"
              onClick={handleLeavePrivateProfile}
            >
              <LogOut size={16} />
              Leave Private Profile
            </button>
          </div>

          {/* VERIFIED MESSAGE */}

          <div className="agent-private-welcome">
            <div className="agent-private-welcome-icon">
              <CheckCircle2 size={28} />
            </div>

            <div>
              <span>
                PRIVATE ACCESS VERIFIED
              </span>

              <h1>
                Welcome back,{" "}
                {agent.fullName?.split(" ")[0]} 👋
              </h1>

              <p>
                Your private RENTO agent profile is
                unlocked.
              </p>
            </div>
          </div>

          {/* PROFILE INFORMATION */}

          <div className="agent-private-profile-grid">
            <div className="agent-private-photo-card">
              <div className="agent-profile-photo-large">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={agent.fullName}
                  />
                ) : (
                  <div className="agent-profile-photo-placeholder">
                    {agent.fullName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="agent-profile-verified">
                <CheckCircle2 size={16} />
                Private Account
              </div>
            </div>

            <div className="agent-private-info">
              <span className="agent-profile-eyebrow">
                YOUR AGENT ACCOUNT
              </span>

              <h2>{agent.fullName}</h2>

              <div className="agent-profile-agency">
                <Building2 size={18} />

                <span>
                  {agent.agencyName ||
                    "Independent Property Agent"}
                </span>
              </div>

              <div className="agent-private-details">
                <div>
                  <Mail size={17} />

                  <div>
                    <span>Email</span>

                    <strong>
                      {agent.email ||
                        "Private account email"}
                    </strong>
                  </div>
                </div>

                <div>
                  <Phone size={17} />

                  <div>
                    <span>Phone</span>

                    <strong>
                      {agent.phone ||
                        "No phone number added"}
                    </strong>
                  </div>
                </div>

                <div>
                  <CalendarDays size={17} />

                  <div>
                    <span>Joined RENTO</span>

                    <strong>
                      {formatDate(agent.createdAt)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PRIVATE PROPERTY PORTFOLIO
      ========================================= */}

      <section className="agent-profile-properties">
        <div className="agent-profile-container">
          <div className="agent-properties-heading">
            <div>
              <span className="agent-profile-section-label">
                YOUR PROPERTY PORTFOLIO
              </span>

              <h2>Your properties.</h2>
            </div>

            <p>
              Manage and review the properties
              connected to your agent account.
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="agent-no-properties">
              <Home
                size={44}
                strokeWidth={1.2}
              />

              <h3>No properties listed yet</h3>

              <p>
                Start listing properties on RENTO
                to build your portfolio.
              </p>

              <Link
                to="/list-property"
                className="agent-profile-cta-button"
              >
                List a Property
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="agent-properties-grid">
              {properties.map((property) => {
                const propertyImage =
                  getPropertyImage(
                    property.images
                  );

                return (
                  <article
                    className="agent-property-card"
                    key={property.id}
                  >
                    <Link
                      to={`/property/${property.id}`}
                      className="agent-property-image"
                    >
                      {propertyImage ? (
                        <img
                          src={propertyImage}
                          alt={property.title}
                        />
                      ) : (
                        <div className="agent-property-placeholder">
                          <Home size={40} />
                        </div>
                      )}

                      <span className="agent-property-type">
                        {property.listingType ===
                        "sale"
                          ? "FOR SALE"
                          : property.listingType ===
                              "rent"
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

                        <span>
                          {property.location}
                        </span>
                      </div>

                      <strong className="agent-property-price">
                        {formatPrice(property.price)}
                      </strong>

                      <div className="agent-property-details">
                        {property.bedrooms !==
                          null &&
                          property.bedrooms !==
                            undefined && (
                            <span>
                              <BedDouble
                                size={16}
                              />
                              {property.bedrooms}
                            </span>
                          )}

                        {property.bathrooms !==
                          null &&
                          property.bathrooms !==
                            undefined && (
                            <span>
                              <Bath size={16} />
                              {property.bathrooms}
                            </span>
                          )}

                        {property.parkingSpaces !==
                          null &&
                          property.parkingSpaces !==
                            undefined && (
                            <span>
                              <Car size={16} />
                              {
                                property.parkingSpaces
                              }
                            </span>
                          )}

                        {property.area && (
                          <span>
                            <Maximize
                              size={16}
                            />
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

      {/* =========================================
          PRIVATE SECURITY SECTION
      ========================================= */}

      <section className="agent-private-security">
        <div className="agent-profile-container">
          <div className="agent-private-security-card">
            <div className="agent-private-security-icon">
              <ShieldCheck size={24} />
            </div>

            <div>
              <span>
                PRIVATE ACCOUNT AREA
              </span>

              <h3>
                Your private information is
                protected.
              </h3>

              <p>
                This profile was opened after
                successful password verification.
                Your private contact information is
                not displayed on your public agent
                profile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AgentPrivateProfile;