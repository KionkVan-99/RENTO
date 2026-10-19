import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  MapPin,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Home,
  LandPlot,
} from "lucide-react";
import { Link } from "react-router-dom";

import "../index.css";

const API_BASE_URL = "http://localhost:5000";

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    return localStorage.getItem("rentoToken");
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/properties`,
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
            "Failed to load properties."
        );
      }

      setProperties(data.properties || []);
    } catch (error) {
      console.error(
        "Admin properties error:",
        error
      );

      setError(
        error.message ||
          "Failed to load properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(property.id);
      setError("");
      setSuccess("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/admin/properties/${property.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete property."
        );
      }

      setProperties((current) =>
        current.filter(
          (item) => item.id !== property.id
        )
      );

      setSuccess(
        `"${property.title}" has been deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete property."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) {
      return "Price unavailable";
    }

    return `₦${Number(price).toLocaleString(
      "en-NG"
    )}`;
  };

  const getImageUrl = (images) => {
    if (
      Array.isArray(images) &&
      images.length > 0
    ) {
      const image = images[0];

      if (
        image.startsWith("http://") ||
        image.startsWith("https://")
      ) {
        return image;
      }

      if (image.startsWith("/")) {
        return `${API_BASE_URL}${image}`;
      }

      return `${API_BASE_URL}/${image}`;
    }

    return "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80";
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
    <div className="admin-properties-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-properties-header">

        <div className="admin-properties-header-inner">

          <Link
            to="/admin"
            className="admin-back-link"
          >
            <ArrowLeft size={17} />
            Admin Center
          </Link>

          <div className="admin-properties-title">

            <div className="admin-properties-badge">
              <ShieldCheck size={14} />
              ADMIN ONLY
            </div>

            <h1>Property Management</h1>

            <p>
              View and manage every property
              listed on RENTO.
            </p>

          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={fetchProperties}
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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-properties-container">

        {/* STAT */}

        <div className="admin-properties-summary">

          <div className="admin-properties-summary-icon">
            <Building2 size={22} />
          </div>

          <div>
            <span>Total Listings</span>
            <strong>
              {loading
                ? "—"
                : properties.length}
            </strong>
          </div>

        </div>

        {/* SUCCESS */}

        {success && (
          <div className="admin-success-message">
            <span>✓</span>
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="admin-error-message">
            <span>!</span>
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="admin-properties-loading">
            <RefreshCw
              size={25}
              className="admin-refresh-spin"
            />

            <p>
              Loading RENTO properties...
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="admin-properties-empty">

            <Building2 size={40} />

            <h2>No properties found</h2>

            <p>
              There are currently no property
              listings on RENTO.
            </p>

          </div>
        ) : (
          <div className="admin-properties-grid">

            {properties.map((property) => (

              <article
                className="admin-property-card"
                key={property.id}
              >

                {/* IMAGE */}

                <div className="admin-property-image">

                  <img
                    src={getImageUrl(
                      property.images
                    )}
                    alt={property.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80";
                    }}
                  />

                  <div className="admin-property-id">
                    ID #{property.id}
                  </div>

                  <div className="admin-property-type">

                    {property.type ===
                    "land" ? (
                      <LandPlot size={14} />
                    ) : (
                      <Home size={14} />
                    )}

                    {property.type ||
                      "Property"}

                  </div>

                </div>

                {/* CONTENT */}

                <div className="admin-property-content">

                  <div className="admin-property-top">

                    <div>

                      <h2>
                        {property.title}
                      </h2>

                      <p className="admin-property-location">
                        <MapPin size={14} />

                        {property.location ||
                          "Location unavailable"}
                      </p>

                    </div>

                  </div>

                  <div className="admin-property-price">
                    {formatPrice(
                      property.price
                    )}

                    {property.listingType && (
                      <span>
                        /
                        {property.listingType}
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}

                  <div className="admin-property-details">

                    {property.bedrooms !==
                      null &&
                      property.bedrooms !==
                        undefined && (
                        <span>
                          🛏️{" "}
                          {property.bedrooms}{" "}
                          Beds
                        </span>
                      )}

                    {property.bathrooms !==
                      null &&
                      property.bathrooms !==
                        undefined && (
                        <span>
                          🚿{" "}
                          {property.bathrooms}{" "}
                          Baths
                        </span>
                      )}

                    {property.area && (
                      <span>
                        📐 {property.area} sqm
                      </span>
                    )}

                  </div>

                  {/* OWNER */}

                  <div className="admin-property-owner">

                    <div>
                      <span>
                        LISTED BY
                      </span>

                      <strong>
                        {property.ownerName ||
                          "Agent"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        LISTED
                      </span>

                      <strong>
                        <CalendarDays
                          size={13}
                        />

                        {formatDate(
                          property.createdAt
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-property-actions">

                    <Link
                      to={`/property/${property.id}`}
                      className="admin-view-property-btn"
                    >
                      View Property
                    </Link>

                    <button
                      type="button"
                      className="admin-delete-property-btn"
                      onClick={() =>
                        handleDelete(
                          property
                        )
                      }
                      disabled={
                        deletingId ===
                        property.id
                      }
                    >

                      {deletingId ===
                      property.id ? (
                        <>
                          <RefreshCw
                            size={15}
                            className="admin-refresh-spin"
                          />

                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2
                            size={15}
                          />

                          Delete
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default AdminProperties;