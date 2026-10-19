
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownUp,
  ArrowRight,
  Heart,
  LandPlot,
  MapPin,
  Ruler,
  Search,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/properties`;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const getImageUrl = (image) => {
  if (!image) return "";

  const url = typeof image === "string" ? image : image.url || image.imageUrl;

  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getPropertyImage = (property) => {
  const images = Array.isArray(property.images)
    ? property.images
    : property.images
      ? [property.images]
      : [];

  return getImageUrl(images[0] || property.image);
};

function Land() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [favorites, setFavorites] = useState([]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load land listings.");
      }

      if (data.success === false) {
        throw new Error(data.message || "Unable to load land listings.");
      }

      const list = Array.isArray(data.properties)
        ? data.properties
        : Array.isArray(data)
          ? data
          : [];

      // Match the lowercase "land" value saved by ListProperty.jsx.
      const landListings = list.filter(
        (property) =>
          String(property.type || "").trim().toLowerCase() === "land"
      );

      setProperties(landListings);
    } catch (err) {
      console.error("Land listings error:", err);
      setError(
        err.message ||
          "Could not connect to RENTO. Make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    let result = properties.filter((property) => {
      const location = [
        property.location,
        property.city,
        property.state,
        property.title,
        property.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = location.includes(search.trim().toLowerCase());
      const price = Number(property.price) || 0;

      const matchesMin = minPrice === "" || price >= Number(minPrice);
      const matchesMax = maxPrice === "" || price <= Number(maxPrice);

      return matchesSearch && matchesMin && matchesMax;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [properties, search, minPrice, maxPrice, sortBy]);

  const toggleFavorite = (id) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  return (
    <>
      <Navbar />

      <main className="land-page">
        <section className="land-hero">
          <div className="land-hero-overlay" />

          <div className="land-hero-content">
            <span className="land-eyebrow">
              <LandPlot size={15} /> RENTO LAND MARKETPLACE
            </span>

            <h1>
              Find land for your
              <br />
              <span>next big idea.</span>
            </h1>

            <p>
              Explore land listings uploaded by property owners and agents.
              Find the right location for your home, business, or investment.
            </p>

            <div className="land-hero-stats">
              <div>
                <strong>{properties.length}</strong>
                <span>Land listings</span>
              </div>
              <div>
                <strong>Verified details</strong>
                <span>Review each listing carefully</span>
              </div>
            </div>
          </div>
        </section>

        <section className="land-content">
          <div className="land-section-heading">
            <div>
              <span className="land-eyebrow">EXPLORE AVAILABLE LAND</span>
              <h2>Land for sale and investment</h2>
              <p>Browse real listings published on RENTO.</p>
            </div>

            <span className="land-result-count">
              {filteredProperties.length} result
              {filteredProperties.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="land-filters">
            <label className="land-search">
              <Search size={19} />
              <input
                type="search"
                placeholder="Search location, state or land..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="land-price-input">
              <span>Min price (₦)</span>
              <input
                type="number"
                min="0"
                placeholder="No minimum"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </label>

            <label className="land-price-input">
              <span>Max price (₦)</span>
              <input
                type="number"
                min="0"
                placeholder="No maximum"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </label>

            <label className="land-sort">
              <SlidersHorizontal size={17} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort land listings"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
              </select>
              <ArrowDownUp size={15} />
            </label>
          </div>

          {loading ? (
            <div className="land-status">
              <span className="land-loader" />
              <h3>Finding available land...</h3>
              <p>Loading listings from RENTO.</p>
            </div>
          ) : error ? (
            <div className="land-status">
              <h3>We couldn't load the listings</h3>
              <p>{error}</p>
              <button
                type="button"
                className="land-retry-button"
                onClick={fetchProperties}
              >
                <RefreshCw size={16} /> Try again
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="land-status">
              <div className="land-empty-icon">
                <LandPlot size={30} />
              </div>
              <h3>
                {properties.length === 0
                  ? "No land listings yet"
                  : "No matching land found"}
              </h3>
              <p>
                {properties.length === 0
                  ? "When an agent publishes a land listing on RENTO, it will appear here."
                  : "Try another location or adjust your price range."}
              </p>

              {(search || minPrice || maxPrice) && (
                <button
                  type="button"
                  className="land-retry-button"
                  onClick={() => {
                    setSearch("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="land-grid">
              {filteredProperties.map((property) => {
                const image = getPropertyImage(property);
                const id = property.id ?? property._id;
                const location =
                  [property.city, property.state].filter(Boolean).join(", ") ||
                  property.location ||
                  "Location not specified";

                return (
                  <article className="land-card" key={id}>
                    <div className="land-card-image">
                      {image ? (
                        <img
                          src={image}
                          alt={property.title || "Land listing"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="land-image-placeholder">
                          <LandPlot size={38} />
                          <span>Land listing</span>
                        </div>
                      )}

                      <span className="land-card-badge">
                        {String(property.listingType || "").toLowerCase() ===
                        "rent"
                          ? "For Rent"
                          : "For Sale"}
                      </span>

                      <button
                        type="button"
                        className={`land-favorite ${
                          favorites.includes(id) ? "active" : ""
                        }`}
                        aria-label="Toggle favorite"
                        onClick={() => toggleFavorite(id)}
                      >
                        <Heart
                          size={19}
                          fill={favorites.includes(id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <div className="land-card-body">
                      <span className="land-card-type">
                        <LandPlot size={14} /> LAND
                      </span>

                      <h3>{property.title || "Available Land"}</h3>

                      <p className="land-card-location">
                        <MapPin size={16} />
                        {location}
                      </p>

                      <div className="land-card-details">
                        <span>
                          <Ruler size={16} />
                          {property.area
                            ? `${Number(property.area).toLocaleString()} sqm`
                            : "Size not specified"}
                        </span>
                      </div>

                      <div className="land-card-bottom">
                        <div>
                          <span className="land-price-label">PRICE</span>
                          <strong>{formatPrice(property.price)}</strong>
                        </div>

                        <Link
                          to={`/property/${id}`}
                          className="land-view-button"
                        >
                          View <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Land;
