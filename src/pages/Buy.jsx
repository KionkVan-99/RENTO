import {
  ArrowRight,
  BedDouble,
  Building2,
  ChevronDown,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Star,
  Home,
  LandPlot,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/buy.css";

// ======================================================
// API
// ======================================================

const API_BASE_URL = "https://rento-api-rime.onrender.com";
const API_URL = `${API_BASE_URL}/api/properties`;

// ======================================================
// HELPERS
// ======================================================

const formatPrice = (price) => {
  if (!price) return "Price on request";

  if (price >= 1000000000) {
    return `₦${(price / 1000000000).toFixed(1)}B`;
  }

  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`;
  }

  return `₦${Number(price).toLocaleString()}`;
};

// Convert backend image paths into usable browser URLs
const getImageUrl = (image) => {
  if (!image) {
    return `${API_BASE_URL}/uploads/placeholder.jpg`;
  }

  // Already a full URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Backend local upload
  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  // Just in case the backend returns uploads/filename.jpg
  return `${API_BASE_URL}/${image}`;
};

const normalizeProperty = (property) => {
  // ======================================================
  // IMAGE HANDLING
  // ======================================================

  let propertyImages = [];

  // NEW DATABASE FORMAT
  if (Array.isArray(property.images)) {
    propertyImages = property.images
      .filter(Boolean)
      .map((image) => getImageUrl(image));
  }

  // OLD DATABASE FORMAT
  if (property.image && propertyImages.length === 0) {
    propertyImages = [getImageUrl(property.image)];
  }

  // FALLBACK
  if (propertyImages.length === 0) {
    propertyImages = [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    ];
  }

  return {
    ...property,

    id: property.id,

    title: property.title || "Untitled property",

    location: property.location || "Nigeria",

    state: property.state || "",

    type: property.type || "Property",

    listingType: property.listingType || "buy",

    bedrooms: Number(property.bedrooms) || 0,

    bathrooms: Number(property.bathrooms) || 0,

    area: property.area
      ? `${Number(property.area).toLocaleString()} sqm`
      : "N/A",

    price: Number(property.price) || 0,

    // FIRST UPLOADED IMAGE = CARD COVER
    image: propertyImages[0],

    // KEEP ALL IMAGES FOR LATER USE
    images: propertyImages,

    featured: Boolean(property.featured),

    source: "seller",

    description: property.description || "No description available.",

    createdAt: property.createdAt,
  };
};
// ======================================================
// PAGE
// ======================================================

function Buy() {
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [propertyType, setPropertyType] = useState("All");

  const [maxPrice, setMaxPrice] = useState("Any");

  const [bedrooms, setBedrooms] = useState("Any");

  const [sort, setSort] = useState("Featured");

  const [liked, setLiked] = useState([]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [searchFocused, setSearchFocused] = useState(false);

  // ====================================================
  // FETCH PROPERTIES
  // ====================================================

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch properties");
      }

      const normalizedProperties = Array.isArray(data.properties)
        ? data.properties.map(normalizeProperty)
        : [];

      setProperties(normalizedProperties);
    } catch (err) {
      console.error("Failed to load properties:", err);

      setError("We couldn't connect to the property marketplace.");

      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    fetchProperties();
  }, []);

  // ====================================================
  // FILTER PROPERTIES
  // ====================================================

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    const query = search.trim().toLowerCase();

    // SEARCH
    if (query) {
      result = result.filter((property) => {
        const searchableText = `
          ${property.title}
          ${property.location}
          ${property.state}
          ${property.type}
          ${property.description}
        `.toLowerCase();

        return searchableText.includes(query);
      });
    }

    // PROPERTY TYPE
    if (propertyType !== "All") {
      result = result.filter(
        (property) =>
          property.type?.toLowerCase() === propertyType.toLowerCase(),
      );
    }

    // MAX PRICE
    if (maxPrice !== "Any") {
      result = result.filter((property) => property.price <= Number(maxPrice));
    }

    // BEDROOMS
    if (bedrooms !== "Any") {
      result = result.filter(
        (property) => Number(property.bedrooms) >= Number(bedrooms),
      );
    }

    // SORT
    if (sort === "Price: Low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "Price: High") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "Newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    if (sort === "Featured") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return result;
  }, [properties, search, propertyType, maxPrice, bedrooms, sort]);

  // ====================================================
  // FAVORITES
  // ====================================================

  const toggleLike = (id) => {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // ====================================================
  // RESET FILTERS
  // ====================================================

  const resetFilters = () => {
    setSearch("");
    setPropertyType("All");
    setMaxPrice("Any");
    setBedrooms("Any");
    setSort("Featured");
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = () => {
    document.getElementById("buy-results")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ====================================================
  // RETRY
  // ====================================================

  const retryFetch = async () => {
    await fetchProperties();
  };

  return (
    <div className="buy-v2">
      <Navbar />

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="buy-hero">
        <div className="buy-hero-grid" />

        <div className="buy-hero-glow buy-hero-glow-one" />

        <div className="buy-hero-glow buy-hero-glow-two" />

        <div className="buy-hero-orbit orbit-one" />

        <div className="buy-hero-orbit orbit-two" />

        <div className="buy-container">
          <div className="buy-hero-content">
            <div className="buy-eyebrow">
              <span className="buy-eyebrow-dot" />
              PROPERTY MARKETPLACE
            </div>

            <h1>
              Find a place
              <span> worth calling home.</span>
            </h1>

            <p className="buy-hero-description">
              Explore houses, apartments, land and premium properties across
              Nigeria. Search through available listings and discover your next
              move.
            </p>

            <div className="buy-hero-actions">
              <button className="buy-primary-button" onClick={handleSearch}>
                Explore properties
                <ArrowRight size={17} />
              </button>

              <Link to="/list-property" className="buy-secondary-button">
                List a property
              </Link>
            </div>

            {/* HERO STATS */}

            <div className="buy-hero-stats">
              <div>
                <strong>{loading ? "..." : `${properties.length}+`}</strong>

                <span>Live properties</span>
              </div>

              <div>
                <strong>17+</strong>

                <span>States covered</span>
              </div>

              <div>
                <strong>24/7</strong>

                <span>Marketplace</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}

          <div className="buy-hero-visual">
            <div className="hero-image-main">
              <img
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
                alt="Modern luxury home"
              />

              <div className="hero-image-overlay" />

              <div className="hero-floating-card">
                <div className="floating-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <span>RENTO VERIFIED</span>

                  <strong>Property discovery made easier</strong>
                </div>
              </div>

              <div className="hero-location-pill">
                <MapPin size={14} />
                Nigeria
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <section className="buy-search-section">
        <div className="buy-container">
          <div
            className={`buy-search-box ${searchFocused ? "is-focused" : ""}`}
          >
            <div className="search-box-heading">
              <div>
                <span className="buy-mini-label">START YOUR SEARCH</span>

                <h2>What are you looking for?</h2>
              </div>

              <Sparkles size={20} />
            </div>

            <div className="buy-search-fields">
              {/* SEARCH */}

              <div className="buy-search-input">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search Lagos, Abuja, Enugu..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />

                {search && (
                  <button
                    className="search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* TYPE */}

              <div className="buy-select-wrap">
                <Building2 size={17} />

                <select
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                >
                  <option value="All">All property types</option>

                  <option value="House">Houses</option>

                  <option value="Apartment">Apartments</option>

                  <option value="Land">Land</option>

                  <option value="Duplex">Duplexes</option>

                  <option value="Commercial">Commercial</option>
                </select>

                <ChevronDown size={15} />
              </div>

              {/* PRICE */}

              <div className="buy-select-wrap">
                <span className="naira-symbol">₦</span>

                <select
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                >
                  <option value="Any">Any price</option>

                  <option value="30000000">Under ₦30M</option>

                  <option value="50000000">Under ₦50M</option>

                  <option value="80000000">Under ₦80M</option>

                  <option value="120000000">Under ₦120M</option>
                </select>

                <ChevronDown size={15} />
              </div>

              <button className="buy-search-button" onClick={handleSearch}>
                Search
                <ArrowRight size={17} />
              </button>
            </div>

            {/* QUICK SEARCH */}

            <div className="buy-quick-search">
              <span>Popular:</span>

              <button onClick={() => setSearch("Lagos")}>Lagos</button>

              <button onClick={() => setSearch("Abuja")}>Abuja</button>

              <button onClick={() => setSearch("Enugu")}>Enugu</button>

              <button onClick={() => setSearch("Owerri")}>Owerri</button>

              <button onClick={() => setSearch("Apartment")}>Apartments</button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          MARKETPLACE INTRO
      ================================================== */}

      <section className="buy-market-intro">
        <div className="buy-container">
          <div className="market-intro-grid">
            <div>
              <span className="buy-mini-label">DISCOVER YOUR NEXT MOVE</span>

              <h2>
                Properties made
                <span> easier to discover.</span>
              </h2>
            </div>

            <p>
              Browse properties by location, price and type. RENTO brings the
              marketplace experience into one simple place so you can spend less
              time searching and more time deciding.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          RESULTS
      ================================================== */}

      <section className="buy-results-section" id="buy-results">
        <div className="buy-container">
          {/* RESULTS HEADER */}

          <div className="buy-results-header">
            <div>
              <div className="results-title-row">
                <span className="results-live-dot" />

                <span>
                  {loading
                    ? "CONNECTING TO MARKETPLACE"
                    : "LIVE SELLER LISTINGS"}
                </span>
              </div>

              <h2>
                {search ? `Results for "${search}"` : "Explore properties"}
              </h2>

              <p>
                {loading
                  ? "Loading available properties..."
                  : `${filteredProperties.length} ${
                      filteredProperties.length === 1
                        ? "property"
                        : "properties"
                    } available to explore`}
              </p>
            </div>

            <div className="buy-results-controls">
              <button
                className="filter-toggle"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal size={16} />
                Filters
                {filtersOpen ? <X size={14} /> : <ChevronDown size={14} />}
              </button>

              <div className="sort-control">
                <span>Sort:</span>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option>Featured</option>

                  <option>Newest</option>

                  <option>Price: Low</option>

                  <option>Price: High</option>
                </select>
              </div>
            </div>
          </div>

          {/* ADVANCED FILTERS */}

          {filtersOpen && (
            <div className="advanced-filters">
              <div className="advanced-filter">
                <label>Property type</label>

                <select
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                >
                  <option value="All">All types</option>

                  <option value="House">House</option>

                  <option value="Apartment">Apartment</option>

                  <option value="Land">Land</option>

                  <option value="Duplex">Duplex</option>

                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div className="advanced-filter">
                <label>Minimum bedrooms</label>

                <select
                  value={bedrooms}
                  onChange={(event) => setBedrooms(event.target.value)}
                >
                  <option value="Any">Any</option>

                  <option value="1">1+</option>

                  <option value="2">2+</option>

                  <option value="3">3+</option>

                  <option value="4">4+</option>

                  <option value="5">5+</option>
                </select>
              </div>

              <div className="advanced-filter">
                <label>Maximum price</label>

                <select
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                >
                  <option value="Any">Any price</option>

                  <option value="30000000">₦30M</option>

                  <option value="50000000">₦50M</option>

                  <option value="80000000">₦80M</option>

                  <option value="120000000">₦120M</option>
                </select>
              </div>

              <button className="reset-filters" onClick={resetFilters}>
                <RotateCcw size={14} />
                Reset filters
              </button>
            </div>
          )}

          {/* ACTIVE FILTERS */}

          {(search ||
            propertyType !== "All" ||
            maxPrice !== "Any" ||
            bedrooms !== "Any") && (
            <div className="active-filters">
              <span>Active:</span>

              {search && (
                <button onClick={() => setSearch("")}>
                  Search: {search}
                  <X size={12} />
                </button>
              )}

              {propertyType !== "All" && (
                <button onClick={() => setPropertyType("All")}>
                  {propertyType}

                  <X size={12} />
                </button>
              )}

              {maxPrice !== "Any" && (
                <button onClick={() => setMaxPrice("Any")}>
                  Under ₦{Number(maxPrice) / 1000000}M
                  <X size={12} />
                </button>
              )}

              {bedrooms !== "Any" && (
                <button onClick={() => setBedrooms("Any")}>
                  {bedrooms}+ bedrooms
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="buy-empty-state">
              <div className="empty-icon">
                <Sparkles size={27} />
              </div>

              <span className="buy-mini-label">CONNECTING</span>

              <h3>Finding available properties...</h3>

              <p>RENTO is loading the latest property listings.</p>
            </div>
          )}

          {/* BACKEND ERROR */}

          {!loading && error && (
            <div className="buy-empty-state">
              <div className="empty-icon">
                <X size={27} />
              </div>

              <span className="buy-mini-label">CONNECTION ERROR</span>

              <h3>We couldn't load the properties.</h3>

              <p>
                  Check your internet connection and try again
              </p>

              <button onClick={retryFetch}>
                Try again
                <RotateCcw size={15} />
              </button>
            </div>
          )}

          {/* PROPERTY GRID */}

          {!loading && !error && filteredProperties.length > 0 && (
            <div className="buy-property-grid">
              {filteredProperties.map((property, index) => (
                <article
                  className={`buy-property-card ${
                    property.featured ? "is-featured" : ""
                  }`}
                  key={property.id}
                  style={{
                    "--card-delay": `${index * 80}ms`,
                  }}
                >
                  {/* IMAGE */}

                  <div className="property-image-wrap">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="property-image"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85";
                      }}
                    />

                    <div className="property-image-shade" />

                    <div className="property-card-top">
                      <div className="property-badges">
                        {property.featured && (
                          <span className="property-featured">
                            <Sparkles size={11} />
                            Featured
                          </span>
                        )}

                        <span className="property-source">Seller listing</span>
                      </div>

                      <button
                        className={`property-like ${
                          liked.includes(property.id) ? "liked" : ""
                        }`}
                        onClick={() => toggleLike(property.id)}
                        aria-label="Save property"
                      >
                        <Heart
                          size={17}
                          fill={
                            liked.includes(property.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    <div className="property-location">
                      <MapPin size={13} />

                      {property.location}
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="property-card-content">
                    <div className="property-card-price">
                      <strong>{formatPrice(property.price)}</strong>

                      {property.listingType === "rent" && <span>/year</span>}
                    </div>

                    <h3>{property.title}</h3>

                    <p className="property-type-line">
                      <Building2 size={13} />

                      {property.type}
                    </p>

                    <div className="property-meta">
                      {property.bedrooms > 0 && (
                        <span>
                          <BedDouble size={15} />
                          {property.bedrooms} Beds
                        </span>
                      )}

                      {property.bathrooms > 0 && (
                        <span>{property.bathrooms} Baths</span>
                      )}

                      <span>{property.area}</span>
                    </div>

                    <div className="property-card-bottom">
                      <div className="property-rating">
                        <Star size={13} fill="currentColor" />

                        <span>4.8</span>
                      </div>

                      <Link
                        to={`/property/${property.id}`}
                        className="property-view"
                      >
                        View property
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && !error && filteredProperties.length === 0 && (
            <div className="buy-empty-state">
              <div className="empty-icon">
                <Search size={27} />
              </div>

              <span className="buy-mini-label">NOTHING FOUND</span>

              <h3>We couldn't find that property.</h3>

              <p>Try another location, property type or price range.</p>

              <button onClick={resetFilters}>
                Reset search
                <RotateCcw size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          DISCOVERY STRIP
      ================================================== */}

      <section className="buy-discovery-section">
        <div className="buy-container">
          <div className="discovery-box">
            <div className="discovery-glow" />

            <div className="discovery-content">
              <span className="buy-mini-label">MORE THAN A SEARCH BAR</span>

              <h2>
                Your next property
                <span> could be closer than you think.</span>
              </h2>

              <p>
                Search by city, property type, bedrooms and budget. Seller
                listings appear here directly from the RENTO marketplace.
              </p>
            </div>

            <div className="discovery-stats">
              <div>
                <Home size={20} />

                <strong>Homes</strong>

                <span>For every lifestyle</span>
              </div>

              <div>
                <LandPlot size={20} />

                <strong>Land</strong>

                <span>Build your future</span>
              </div>

              <div>
                <Building2 size={20} />

                <strong>Commercial</strong>

                <span>For your business</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SELLER CTA
      ================================================== */}

      <section className="buy-seller-section">
        <div className="buy-container">
          <div className="seller-cta">
            <div className="seller-cta-number">01</div>

            <div className="seller-cta-content">
              <span className="buy-mini-label">ARE YOU A PROPERTY OWNER?</span>

              <h2>
                Put your property
                <span> in front of buyers.</span>
              </h2>

              <p>
                Upload your property details and let people searching on RENTO
                discover what you have available.
              </p>

              <Link to="/list-property" className="seller-cta-button">
                List your property
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="seller-cta-mark">R</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Buy;
