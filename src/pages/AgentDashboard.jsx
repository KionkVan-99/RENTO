import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  LandPlot,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Pencil,
  BadgeCheck,
  RotateCcw,
  Trash2,
  Sparkles,
  X,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";

import "../index.css";

const API_BASE_URL = "https://rento-api-rime.onrender.com";

// ======================================================
// FEATURED PACKAGES
// ======================================================

const FEATURED_PACKAGES = [
  {
    id: "7_days",
    name: "7 Days",
    price: 2000,
    description: "Give your property extra visibility for one week.",
  },
  {
    id: "14_days",
    name: "14 Days",
    price: 4000,
    description: "Keep your property highlighted for two weeks.",
  },
  {
    id: "30_days",
    name: "30 Days",
    price: 7500,
    description: "Maximum visibility for a full month.",
  },
];

function AgentDashboard() {
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // ======================================================
  // RENTAL MODAL
  // ======================================================

  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [rentalProperty, setRentalProperty] = useState(null);

  const [rentalForm, setRentalForm] = useState({
    tenantName: "",
    tenantPhone: "",
    tenantEmail: "",
    monthlyRent: "",
    moveInDate: "",
    leaseDuration: "1 year",
  });

  // ======================================================
  // FEATURED MODAL
  // ======================================================

  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);
  const [featuredProperty, setFeaturedProperty] = useState(null);
  const [selectedFeaturedPackage, setSelectedFeaturedPackage] =
    useState("7_days");
  const [featuredLoading, setFeaturedLoading] = useState(false);

  // ======================================================
  // AGENT
  // ======================================================

  const agent = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("rentoAgent") || "null");
    } catch {
      return null;
    }
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("rentoToken");
    localStorage.removeItem("rentoAgent");

    window.location.href = "/agent/login";
  };

  // ======================================================
  // FETCH DASHBOARD DATA
  // ======================================================

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("rentoToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const [propertiesResponse, messagesResponse, featuredResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/properties/agent/my-properties`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_BASE_URL}/api/messages`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_BASE_URL}/api/payments/my-featured`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const propertiesData = await propertiesResponse.json();
      const messagesData = await messagesResponse.json();
      const featuredData = await featuredResponse.json();

      if (!propertiesResponse.ok) {
        throw new Error(
          propertiesData.message || "Failed to load your properties.",
        );
      }

      if (!messagesResponse.ok) {
        throw new Error(messagesData.message || "Failed to load messages.");
      }

      if (!featuredResponse.ok) {
        throw new Error(
          featuredData.message || "Failed to load featured listings.",
        );
      }

      setProperties(propertiesData.properties || []);
      setMessages(messagesData.messages || []);
      setFeaturedListings(featuredData.featuredListings || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ======================================================
  // DERIVED DATA
  // ======================================================

  const unreadMessages = useMemo(
    () => messages.filter((message) => !message.isRead),
    [messages],
  );

  const recentMessages = useMemo(() => messages.slice(0, 4), [messages]);

  const recentProperties = useMemo(() => properties.slice(0, 4), [properties]);

  const activeProperties = useMemo(
    () =>
      properties.filter(
        (property) => (property.status || "active") === "active",
      ),
    [properties],
  );

  const soldProperties = useMemo(
    () => properties.filter((property) => property.status === "sold"),
    [properties],
  );

  const rentedProperties = useMemo(
    () => properties.filter((property) => property.status === "rented"),
    [properties],
  );

  const pendingProperties = useMemo(
    () => properties.filter((property) => property.status === "pending"),
    [properties],
  );

  const totalValue = useMemo(
    () =>
      properties.reduce(
        (total, property) => total + Number(property.price || 0),
        0,
      ),
    [properties],
  );

  // ======================================================
  // HELPERS
  // ======================================================

  const formatPrice = (price) => {
    if (!price) return "Price unavailable";

    return `₦${Number(price).toLocaleString("en-NG")}`;
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_BASE_URL}${image}`;
    }

    return `${API_BASE_URL}/${image}`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "sold":
        return "SOLD";

      case "rented":
        return "RENTED";

      case "pending":
        return "PENDING";

      case "suspended":
        return "SUSPENDED";

      case "removed":
        return "REMOVED";

      default:
        return "ACTIVE";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "sold":
        return "sold";

      case "rented":
        return "rented";

      case "pending":
        return "pending";

      case "suspended":
        return "suspended";

      case "removed":
        return "removed";

      default:
        return "active";
    }
  };

  // ======================================================
  // FEATURED HELPERS
  // ======================================================

  const getFeaturedForProperty = (propertyId) => {
    return featuredListings.find(
      (listing) => Number(listing.propertyId) === Number(propertyId),
    );
  };

  const hasFeaturedRequest = (propertyId) => {
    const listing = getFeaturedForProperty(propertyId);

    return (
      listing && (listing.status === "pending" || listing.status === "active")
    );
  };

  const openFeaturedModal = (property) => {
    setFeaturedProperty(property);
    setSelectedFeaturedPackage("7_days");
    setError("");
    setFeaturedModalOpen(true);
  };

  const closeFeaturedModal = () => {
    if (featuredLoading) return;

    setFeaturedModalOpen(false);
    setFeaturedProperty(null);
    setSelectedFeaturedPackage("7_days");
  };

  const handleFeaturedRequest = async (event) => {
    event.preventDefault();

    if (!featuredProperty) return;

    try {
      const token = localStorage.getItem("rentoToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      setFeaturedLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/payments/featured`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: featuredProperty.id,
          package: selectedFeaturedPackage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create featured listing request.",
        );
      }

      setFeaturedListings((current) => [data.featuredListing, ...current]);

      setFeaturedModalOpen(false);
      setFeaturedProperty(null);

      alert(
        "Featured listing request created successfully. Payment will be connected soon.",
      );
    } catch (err) {
      console.error("Featured listing error:", err);

      setError(err.message || "Unable to create featured listing request.");
    } finally {
      setFeaturedLoading(false);
    }
  };
  // ======================================================
  // PROPERTY ACTIONS
  // ======================================================

  const handlePropertyAction = async (propertyId, action, successMessage) => {
    try {
      const token = localStorage.getItem("rentoToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      setActionLoading(`${action}-${propertyId}`);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${propertyId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} property.`);
      }

      await fetchDashboardData(true);

      alert(data.message || successMessage || "Property updated successfully.");
    } catch (err) {
      console.error(`Property ${action} error:`, err);

      setError(err.message || `Failed to ${action} property.`);
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // DELETE PROPERTY
  // ======================================================

  const handleDeleteProperty = async (property) => {
    const confirmed = window.confirm(
      `Delete "${property.title}" permanently?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("rentoToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      setActionLoading(`delete-${property.id}`);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${property.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete property.");
      }

      setProperties((currentProperties) =>
        currentProperties.filter((item) => item.id !== property.id),
      );

      alert(data.message || "Property deleted successfully.");
    } catch (err) {
      console.error("Delete property error:", err);

      setError(err.message || "Failed to delete property.");
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // MARK SOLD
  // ======================================================

  const handleMarkSold = (property) => {
    const confirmed = window.confirm(`Mark "${property.title}" as SOLD?`);

    if (!confirmed) return;

    handlePropertyAction(property.id, "sold", "Property marked as sold.");
  };

  // ======================================================
  // MARK RENTED
  // ======================================================

  const handleMarkRented = (property) => {
    setRentalProperty(property);

    setRentalForm({
      tenantName: "",
      tenantPhone: "",
      tenantEmail: "",
      monthlyRent: property.price || "",
      moveInDate: "",
      leaseDuration: "1 year",
    });

    setError("");
    setRentalModalOpen(true);
  };

  // ======================================================
  // RENTAL SUBMIT
  // ======================================================

  const handleRentalSubmit = async (event) => {
    event.preventDefault();

    if (!rentalProperty) return;

    try {
      const token = localStorage.getItem("rentoToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!rentalForm.tenantName.trim()) {
        throw new Error("Tenant name is required.");
      }

      if (!rentalForm.tenantPhone.trim()) {
        throw new Error("Tenant phone number is required.");
      }

      if (!rentalForm.monthlyRent || Number(rentalForm.monthlyRent) <= 0) {
        throw new Error("A valid monthly rent is required.");
      }

      if (!rentalForm.moveInDate) {
        throw new Error("Move-in date is required.");
      }

      if (!rentalForm.leaseDuration) {
        throw new Error("Lease duration is required.");
      }

      setActionLoading(`rented-${rentalProperty.id}`);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${rentalProperty.id}/rented`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tenantName: rentalForm.tenantName.trim(),
            tenantPhone: rentalForm.tenantPhone.trim(),
            tenantEmail: rentalForm.tenantEmail.trim(),
            monthlyRent: Number(rentalForm.monthlyRent),
            moveInDate: rentalForm.moveInDate,
            leaseDuration: rentalForm.leaseDuration,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark property as rented.");
      }

      setRentalModalOpen(false);
      setRentalProperty(null);

      setRentalForm({
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        monthlyRent: "",
        moveInDate: "",
        leaseDuration: "1 year",
      });

      await fetchDashboardData();
    } catch (error) {
      console.error("Property rented error:", error);
      setError(error.message || "Failed to mark property as rented.");
    } finally {
      setActionLoading("");
    }
  };

  // ======================================================
  // RESTORE
  // ======================================================

  const handleRestore = (property) => {
    const confirmed = window.confirm(`Restore "${property.title}" to ACTIVE?`);

    if (!confirmed) return;

    handlePropertyAction(
      property.id,
      "restore",
      "Property restored to active.",
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="agent-dashboard-page">
      {/* ==================================================
          FEATURED PROPERTY MODAL
      ================================================== */}

      {featuredModalOpen && featuredProperty && (
        <div
          className="rento-featured-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !featuredLoading) {
              closeFeaturedModal();
            }
          }}
        >
          <div className="rento-featured-modal">
            <div className="rento-featured-modal-header">
              <div>
                <span className="rento-featured-modal-eyebrow">
                  BOOST VISIBILITY
                </span>

                <h2>Feature this property</h2>

                <p>
                  Put <strong>{featuredProperty.title}</strong> in front of more
                  people on RENTO.
                </p>
              </div>

              <button
                type="button"
                className="rento-featured-modal-close"
                onClick={closeFeaturedModal}
                disabled={featuredLoading}
              >
                <X size={18} />
              </button>
            </div>

            {/* PROPERTY PREVIEW */}

            <div className="rento-featured-property-preview">
              <div className="rento-featured-preview-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <span>PROPERTY</span>

                <strong>{featuredProperty.title}</strong>

                <small>
                  <MapPin size={13} />
                  {featuredProperty.location || "Location unavailable"}
                </small>
              </div>
            </div>

            {/* PACKAGES */}

            <form onSubmit={handleFeaturedRequest}>
              <div className="rento-featured-packages">
                {FEATURED_PACKAGES.map((featuredPackage) => {
                  const selected =
                    selectedFeaturedPackage === featuredPackage.id;

                  return (
                    <button
                      key={featuredPackage.id}
                      type="button"
                      className={`rento-featured-package ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedFeaturedPackage(featuredPackage.id)
                      }
                    >
                      <div className="rento-featured-package-top">
                        <div>
                          <span>FEATURED</span>

                          <strong>{featuredPackage.name}</strong>
                        </div>

                        <div className="rento-featured-package-check">
                          {selected && <CheckCircle2 size={18} />}
                        </div>
                      </div>

                      <div className="rento-featured-package-price">
                        ₦{featuredPackage.price.toLocaleString("en-NG")}
                      </div>

                      <p>{featuredPackage.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* PAYMENT NOTE */}

              <div className="rento-featured-payment-note">
                <div>
                  <Crown size={18} />
                </div>

                <p>
                  <strong>Payment gateway coming next.</strong>
                  <br />
                  This currently creates a featured listing request without
                  charging your account.
                </p>
              </div>

              {/* ACTIONS */}

              <div className="rento-featured-modal-actions">
                <button
                  type="button"
                  className="rento-featured-cancel"
                  onClick={closeFeaturedModal}
                  disabled={featuredLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rento-featured-confirm"
                  disabled={featuredLoading}
                >
                  {featuredLoading ? "Creating Request..." : "Continue"}
                  {!featuredLoading && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          RENTAL MODAL
      ================================================== */}

      {rentalModalOpen && rentalProperty && (
        <div
          className="rento-rental-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRentalModalOpen(false);
            }
          }}
        >
          <div className="rento-rental-modal">
            <div className="rento-rental-modal-header">
              <div>
                <span className="rento-rental-modal-eyebrow">
                  COMPLETE RENTAL
                </span>

                <h2>Rental Details</h2>

                <p>
                  Complete the information for{" "}
                  <strong>{rentalProperty.title}</strong>.
                </p>
              </div>

              <button
                type="button"
                className="rento-rental-modal-close"
                onClick={() => setRentalModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="rento-rental-form" onSubmit={handleRentalSubmit}>
              <div className="rento-rental-property-preview">
                <div>
                  <span>PROPERTY</span>
                  <strong>{rentalProperty.title}</strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {rentalProperty.location || "Location unavailable"}
                  </strong>
                </div>
              </div>

              <div className="rento-rental-form-grid">
                <div className="rento-form-group">
                  <label>Tenant Name *</label>

                  <input
                    type="text"
                    value={rentalForm.tenantName}
                    onChange={(event) =>
                      setRentalForm((previous) => ({
                        ...previous,
                        tenantName: event.target.value,
                      }))
                    }
                    placeholder="Enter tenant's full name"
                    required
                  />
                </div>

                <div className="rento-form-group">
                  <label>Tenant Phone *</label>

                  <input
                    type="tel"
                    value={rentalForm.tenantPhone}
                    onChange={(event) =>
                      setRentalForm((previous) => ({
                        ...previous,
                        tenantPhone: event.target.value,
                      }))
                    }
                    placeholder="08012345678"
                    required
                  />
                </div>

                <div className="rento-form-group">
                  <label>Tenant Email</label>

                  <input
                    type="email"
                    value={rentalForm.tenantEmail}
                    onChange={(event) =>
                      setRentalForm((previous) => ({
                        ...previous,
                        tenantEmail: event.target.value,
                      }))
                    }
                    placeholder="tenant@example.com"
                  />
                </div>

                <div className="rento-form-group">
                  <label>Monthly Rent *</label>

                  <div className="rento-rental-input-prefix">
                    <span>₦</span>

                    <input
                      type="number"
                      min="1"
                      value={rentalForm.monthlyRent}
                      onChange={(event) =>
                        setRentalForm((previous) => ({
                          ...previous,
                          monthlyRent: event.target.value,
                        }))
                      }
                      placeholder="500000"
                      required
                    />
                  </div>
                </div>

                <div className="rento-form-group">
                  <label>Move-in Date *</label>

                  <input
                    type="date"
                    value={rentalForm.moveInDate}
                    onChange={(event) =>
                      setRentalForm((previous) => ({
                        ...previous,
                        moveInDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="rento-form-group">
                  <label>Lease Duration *</label>

                  <select
                    value={rentalForm.leaseDuration}
                    onChange={(event) =>
                      setRentalForm((previous) => ({
                        ...previous,
                        leaseDuration: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                    <option value="3 years">3 years</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="rento-rental-private-note">
                <span>🔒</span>

                <p>
                  Tenant information is private and is only available to
                  authorized agents managing this property.
                </p>
              </div>

              <div className="rento-rental-modal-actions">
                <button
                  type="button"
                  className="rento-rental-cancel"
                  onClick={() => setRentalModalOpen(false)}
                  disabled={actionLoading === `rented-${rentalProperty.id}`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rento-rental-confirm"
                  disabled={actionLoading === `rented-${rentalProperty.id}`}
                >
                  {actionLoading === `rented-${rentalProperty.id}`
                    ? "Saving Rental..."
                    : "Confirm Rental"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="agent-dashboard-header">
        <div className="agent-dashboard-header-inner">
          <Link to="/" className="agent-dashboard-logo">
            <span>RENTO</span>
            <small>AGENT CENTER</small>
          </Link>

          <nav className="agent-dashboard-nav">
            <Link to="/agent" className="agent-nav-link active">
              Dashboard
            </Link>

            <Link to="/buy" className="agent-nav-link">
              Browse
            </Link>

            <Link to="/plans" className="agent-nav-link">
              <Crown size={15} />
              Upgrade Plan
            </Link>
          </nav>

          <div className="agent-dashboard-header-actions">
            <button
              className="agent-dashboard-refresh"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "agent-spin" : ""} />
              Refresh
            </button>

            <Link to="/" className="agent-view-site">
              View Site
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              className="agent-dashboard-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="agent-dashboard-container">
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="agent-dashboard-hero">
          <div className="agent-dashboard-hero-content">
            <span className="agent-dashboard-eyebrow">
              <span className="agent-live-dot"></span>
              AGENT WORKSPACE
            </span>

            <h1>
              Welcome to your
              <span> Agent Center.</span>
            </h1>

            <p>
              Manage your properties, respond to inquiries, and keep track of
              your RENTO activity from one place.
            </p>

            <div className="agent-dashboard-hero-actions">
              <Link to="/list-property" className="agent-primary-btn">
                <Plus size={18} />
                Add Property
              </Link>

              <Link to="/agent/messages" className="agent-secondary-btn">
                <MessageSquare size={18} />
                View Messages
                {unreadMessages.length > 0 && (
                  <span className="agent-message-badge">
                    {unreadMessages.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="agent-dashboard-hero-card">
            <div className="hero-card-top">
              <span>PORTFOLIO VALUE</span>
              <TrendingUp size={19} />
            </div>

            <strong>{loading ? "..." : formatPrice(totalValue)}</strong>

            <p>
              Across {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"}
            </p>

            <div className="hero-card-line"></div>

            <div className="hero-card-bottom">
              <span>RENTO MARKETPLACE</span>
              <CheckCircle2 size={16} />
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="agent-dashboard-error">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        {/* STATS */}

        <section className="agent-stat-grid">
          <div className="agent-stat-card">
            <div className="agent-stat-icon">
              <Building2 size={21} />
            </div>

            <div>
              <span>Total Properties</span>
              <strong>{loading ? "—" : properties.length}</strong>
            </div>

            <div className="agent-stat-arrow">
              <ArrowRight size={17} />
            </div>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-icon">
              <BadgeCheck size={21} />
            </div>

            <div>
              <span>Active Listings</span>
              <strong>{loading ? "—" : activeProperties.length}</strong>
            </div>

            <div className="agent-stat-arrow">
              <ArrowRight size={17} />
            </div>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Sold</span>
              <strong>{loading ? "—" : soldProperties.length}</strong>
            </div>

            <div className="agent-stat-arrow">
              <ArrowRight size={17} />
            </div>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-icon">
              <Home size={21} />
            </div>

            <div>
              <span>Rented</span>
              <strong>{loading ? "—" : rentedProperties.length}</strong>
            </div>

            <div className="agent-stat-arrow">
              <ArrowRight size={17} />
            </div>
          </div>
        </section>

        {/* PROPERTY SUMMARY */}

        <section className="agent-property-summary">
          <div className="agent-property-summary-card">
            <span>ACTIVE</span>
            <strong>{loading ? "—" : activeProperties.length}</strong>
          </div>

          <div className="agent-property-summary-card">
            <span>SOLD</span>
            <strong>{loading ? "—" : soldProperties.length}</strong>
          </div>

          <div className="agent-property-summary-card">
            <span>RENTED</span>
            <strong>{loading ? "—" : rentedProperties.length}</strong>
          </div>

          <div className="agent-property-summary-card">
            <span>PENDING</span>
            <strong>{loading ? "—" : pendingProperties.length}</strong>
          </div>
        </section>

        {/* MAIN GRID */}

        <section className="agent-dashboard-grid">
          {/* PROPERTIES */}

          <div className="agent-dashboard-panel">
            <div className="agent-panel-header">
              <div>
                <span className="agent-panel-eyebrow">PORTFOLIO</span>

                <h2>Your Properties</h2>
              </div>

              <Link to="/list-property" className="agent-panel-add">
                <Plus size={15} />
                Add
              </Link>
            </div>

            {loading ? (
              <div className="agent-panel-loading">
                Loading your properties...
              </div>
            ) : recentProperties.length === 0 ? (
              <div className="agent-panel-empty">
                <div>
                  <Home size={27} />
                </div>

                <h3>No properties yet</h3>

                <p>Start by publishing your first property.</p>

                <Link to="/list-property">
                  Add your first property
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="agent-property-list">
                {recentProperties.map((property) => {
                  const status = property.status || "active";

                  const firstImage =
                    Array.isArray(property.images) && property.images.length > 0
                      ? property.images[0]
                      : null;

                  const isDeleting = actionLoading === `delete-${property.id}`;

                  const isSoldLoading = actionLoading === `sold-${property.id}`;

                  const isRentedLoading =
                    actionLoading === `rented-${property.id}`;

                  const isRestoreLoading =
                    actionLoading === `restore-${property.id}`;

                  const featuredListing = getFeaturedForProperty(property.id);

                  const propertyIsFeatured =
                    featuredListing?.status === "active";

                  const propertyHasFeaturedRequest = hasFeaturedRequest(
                    property.id,
                  );

                  return (
                    <article
                      className={`rento-property-management-card ${
                        propertyIsFeatured ? "rento-property-is-featured" : ""
                      }`}
                      key={property.id}
                    >
                      <Link
                        to={`/property/${property.id}`}
                        className="rento-property-management-image"
                      >
                        <img
                          src={getImageUrl(firstImage)}
                          alt={property.title}
                          onError={(event) => {
                            event.currentTarget.src =
                              "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80";
                          }}
                        />

                        <span
                          className={`rento-property-management-status ${getStatusClass(
                            status,
                          )}`}
                        >
                          <span></span>
                          {getStatusLabel(status)}
                        </span>

                        {propertyIsFeatured && (
                          <span className="rento-featured-card-badge">
                            <Sparkles size={12} />
                            FEATURED
                          </span>
                        )}
                      </Link>

                      <div className="rento-property-management-content">
                        <div className="rento-property-management-top">
                          <div>
                            <span className="rento-property-management-type">
                              {property.type === "land" ? (
                                <LandPlot size={14} />
                              ) : (
                                <Home size={14} />
                              )}

                              {property.type || "Property"}
                            </span>

                            <h3>{property.title}</h3>

                            <p className="rento-property-management-location">
                              <MapPin size={15} />
                              {property.location || "Location unavailable"}
                            </p>
                          </div>

                          <div className="rento-property-management-price">
                            {formatPrice(property.price)}

                            {property.listingType && (
                              <small>For {property.listingType}</small>
                            )}
                          </div>
                        </div>

                        <div className="rento-property-management-details">
                          {property.type !== "land" && (
                            <>
                              <div>
                                <strong>{property.bedrooms ?? 0}</strong>
                                <span>Bedrooms</span>
                              </div>

                              <div>
                                <strong>{property.bathrooms ?? 0}</strong>
                                <span>Bathrooms</span>
                              </div>

                              <div>
                                <strong>{property.parkingSpaces ?? 0}</strong>
                                <span>Parking</span>
                              </div>
                            </>
                          )}

                          {property.area && (
                            <div>
                              <strong>
                                {Number(property.area).toLocaleString()}
                              </strong>

                              <span>{property.landUnit || "sqm"}</span>
                            </div>
                          )}

                          <div>
                            <strong>{formatDate(property.createdAt)}</strong>
                            <span>Listed</span>
                          </div>
                        </div>

                        <div className="rento-property-management-actions">
                          <Link
                            to={`/property/${property.id}`}
                            className="rento-management-btn view"
                          >
                            <ArrowRight size={15} />
                            View
                          </Link>

                          {status === "active" && (
                            <>
                              <Link
                                to={`/agent/edit-property/${property.id}`}
                                className="rento-management-btn edit"
                              >
                                <Pencil size={15} />
                                Edit
                              </Link>

                              {!propertyHasFeaturedRequest ? (
                                <button
                                  type="button"
                                  className="rento-management-btn featured"
                                  onClick={() => openFeaturedModal(property)}
                                  disabled={
                                    isSoldLoading ||
                                    isRentedLoading ||
                                    isDeleting
                                  }
                                >
                                  <Sparkles size={15} />
                                  Boost
                                </button>
                              ) : (
                                <span
                                  className={`rento-management-btn featured-status ${
                                    featuredListing?.status === "active"
                                      ? "active"
                                      : "pending"
                                  }`}
                                >
                                  <Sparkles size={15} />

                                  {featuredListing?.status === "active"
                                    ? "Featured"
                                    : "Pending"}
                                </span>
                              )}

                              <button
                                type="button"
                                className="rento-management-btn sold"
                                onClick={() => handleMarkSold(property)}
                                disabled={
                                  isSoldLoading || isRentedLoading || isDeleting
                                }
                              >
                                <CheckCircle2 size={15} />
                                {isSoldLoading ? "..." : "Mark Sold"}
                              </button>

                              <button
                                type="button"
                                className="rento-management-btn rented"
                                onClick={() => handleMarkRented(property)}
                                disabled={
                                  isSoldLoading || isRentedLoading || isDeleting
                                }
                              >
                                <Home size={15} />
                                {isRentedLoading ? "..." : "Mark Rented"}
                              </button>
                            </>
                          )}

                          {(status === "sold" || status === "rented") && (
                            <button
                              type="button"
                              className="rento-management-btn restore"
                              onClick={() => handleRestore(property)}
                              disabled={isRestoreLoading || isDeleting}
                            >
                              <RotateCcw size={15} />
                              {isRestoreLoading ? "..." : "Restore"}
                            </button>
                          )}

                          <button
                            type="button"
                            className="rento-management-btn delete"
                            onClick={() => handleDeleteProperty(property)}
                            disabled={
                              isDeleting ||
                              isSoldLoading ||
                              isRentedLoading ||
                              isRestoreLoading
                            }
                          >
                            <Trash2 size={15} />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {properties.length > 4 && (
              <div className="agent-panel-footer">
                <span>Showing 4 of {properties.length} properties</span>
              </div>
            )}
          </div>

          {/* MESSAGES */}

          <div className="agent-dashboard-panel">
            <div className="agent-panel-header">
              <div>
                <span className="agent-panel-eyebrow">INBOX</span>
                <h2>Recent Messages</h2>
              </div>

              <Link to="/agent/messages" className="agent-panel-view">
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div className="agent-panel-loading">Loading messages...</div>
            ) : recentMessages.length === 0 ? (
              <div className="agent-panel-empty">
                <div>
                  <MessageSquare size={27} />
                </div>

                <h3>No messages yet</h3>
                <p>Visitor inquiries will appear here.</p>
              </div>
            ) : (
              <div className="agent-message-list-preview">
                {recentMessages.map((message) => (
                  <Link
                    to="/agent/messages"
                    className={`agent-message-preview ${
                      !message.isRead ? "unread" : ""
                    }`}
                    key={message.id}
                  >
                    <div className="agent-message-avatar">
                      {message.senderName?.charAt(0).toUpperCase() || "?"}
                    </div>

                    <div className="agent-message-preview-content">
                      <div>
                        <h3>{message.senderName}</h3>

                        {!message.isRead && (
                          <span className="agent-unread-dot"></span>
                        )}
                      </div>

                      <p>{message.message}</p>

                      <span>{message.propertyTitle || "Property inquiry"}</span>
                    </div>

                    <div className="agent-message-date">
                      {formatDate(message.createdAt)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="agent-quick-section">
          <div className="agent-section-heading">
            <div>
              <span>QUICK ACTIONS</span>
              <h2>What would you like to do?</h2>
            </div>
          </div>

          <div className="agent-quick-grid">
            <Link to="/list-property" className="agent-quick-card">
              <div className="agent-quick-icon">
                <Plus size={22} />
              </div>

              <div>
                <h3>List a Property</h3>
                <p>Publish a house, apartment or land.</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link to="/agent/messages" className="agent-quick-card">
              <div className="agent-quick-icon">
                <MessageSquare size={22} />
              </div>

              <div>
                <h3>Manage Messages</h3>
                <p>Respond to people interested in your properties.</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link to="/buy" className="agent-quick-card">
              <div className="agent-quick-icon">
                <Users size={22} />
              </div>

              <div>
                <h3>Browse Marketplace</h3>
                <p>See what visitors see on RENTO.</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link to="/plans" className="agent-quick-card">
              <div className="agent-quick-icon">
                <Crown size={22} />
              </div>

              <div>
                <h3>Upgrade Your Plan</h3>
                <p>Explore Free, Pro and Business plans.</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <button
              className="agent-quick-card"
              type="button"
              onClick={() => alert("Agent settings will be available soon.")}
            >
              <div className="agent-quick-icon">
                <Settings size={22} />
              </div>

              <div>
                <h3>Agent Settings</h3>
                <p>Manage your agent profile and account.</p>
              </div>

              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AgentDashboard;
