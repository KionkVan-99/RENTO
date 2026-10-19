
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Heart,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  House,
  X,
  RotateCcw,
  KeyRound,
  Building2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { properties as localProperties } from "../data/properties";

const API_URL = "http://localhost:5000/api";

const sampleRentals = [
  {
    id: "rent-demo-1",
    title: "Contemporary 3 Bedroom Residence",
    type: "Apartment",
    purpose: "Rent",
    listingType: "Rent",
    location: "GRA, Aba, Abia State",
    price: 2400000,
    period: "per year",
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85",
    featured: true,
  },
  {
    id: "rent-demo-2",
    title: "Elegant Modern Family Home",
    type: "House",
    purpose: "Rent",
    listingType: "Rent",
    location: "Lekki Phase 1, Lagos",
    price: 6500000,
    period: "per year",
    bedrooms: 4,
    bathrooms: 4,
    area: 260,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=85",
    featured: false,
  },
  {
    id: "rent-demo-3",
    title: "Stylish City Apartment",
    type: "Apartment",
    purpose: "Rent",
    listingType: "Rent",
    location: "Wuse 2, Abuja",
    price: 3200000,
    period: "per year",
    bedrooms: 2,
    bathrooms: 2,
    area: 130,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85",
    featured: false,
  },
  {
    id: "rent-demo-4",
    title: "Spacious 3 Bedroom Apartment",
    type: "Apartment",
    purpose: "Rent",
    listingType: "Rent",
    location: "New Haven, Enugu",
    price: 1800000,
    period: "per year",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=85",
    featured: false,
  },
  {
    id: "rent-demo-5",
    title: "Luxury Detached Duplex",
    type: "House",
    purpose: "Rent",
    listingType: "Rent",
    location: "Umuahia, Abia State",
    price: 2800000,
    period: "per year",
    bedrooms: 4,
    bathrooms: 4,
    area: 300,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=85",
    featured: false,
  },
  {
    id: "rent-demo-6",
    title: "Bright Minimalist Studio",
    type: "Studio",
    purpose: "Rent",
    listingType: "Rent",
    location: "Yaba, Lagos",
    price: 1200000,
    period: "per year",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85",
    featured: false,
  },
];

const getImage = (property) => {
  const images = property.images;
  const firstImage = Array.isArray(images)
    ? images[0]
    : typeof images === "string"
      ? images
      : null;

  return (
    property.image ||
    firstImage ||
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85"
  );
};

const isRental = (property) => {
  const purpose = String(
    property.purpose || property.listingType || property.listingPurpose || "",
  ).toLowerCase();

  return (
    purpose.includes("rent") ||
    purpose.includes("lease") ||
    purpose.includes("rental")
  );
};

const formatPrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Price on request";
  }

  return `₦${amount.toLocaleString("en-NG")}`;
};

const normalizeProperty = (property, index) => ({
  ...property,
  id: property.id ?? property._id ?? `property-${index}`,
  title: property.title || property.name || "Beautiful Rental Property",
  type: property.type || property.propertyType || "Property",
  location: property.location || property.address || "Location available on request",
  price: property.price ?? property.rent ?? 0,
  bedrooms: property.bedrooms ?? property.beds ?? 0,
  bathrooms: property.bathrooms ?? property.baths ?? 0,
  area: property.area ?? property.size ?? 0,
  image: getImage(property),
});

function Rent() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All types");
  const [bedrooms, setBedrooms] = useState("Any");
  const [maxPrice, setMaxPrice] = useState("Any budget");
  const [sort, setSort] = useState("recommended");
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/properties`);

        if (!response.ok) {
          throw new Error("Could not load properties");
        }

        const result = await response.json();

        const rows = Array.isArray(result)
          ? result
          : Array.isArray(result.properties)
            ? result.properties
            : Array.isArray(result.data)
              ? result.data
              : Array.isArray(result.data?.properties)
                ? result.data.properties
                : [];

        if (active && rows.length > 0) {
          const rentals = rows
            .filter(isRental)
            .filter(
              (property) =>
                !property.status ||
                ["active", "available", "published"].includes(
                  String(property.status).toLowerCase(),
                ),
            )
            .map(normalizeProperty);

          setProperties(rentals);
          setApiAvailable(true);
        } else if (active) {
          const localRentals = (Array.isArray(localProperties)
            ? localProperties
            : []
          )
            .filter(isRental)
            .map(normalizeProperty);

          setProperties(localRentals.length ? localRentals : sampleRentals);
        }
      } catch (error) {
        const localRentals = (Array.isArray(localProperties)
          ? localProperties
          : []
        )
          .filter(isRental)
          .map(normalizeProperty);

        if (active) {
          setProperties(localRentals.length ? localRentals : sampleRentals);
          setApiAvailable(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProperties();

    return () => {
      active = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    let results = [...properties];

    const query = search.trim().toLowerCase();
    const areaQuery = location.trim().toLowerCase();

    if (query) {
      results = results.filter((property) =>
        `${property.title} ${property.location} ${property.type}`
          .toLowerCase()
          .includes(query),
      );
    }

    if (areaQuery) {
      results = results.filter((property) =>
        String(property.location).toLowerCase().includes(areaQuery),
      );
    }

    if (type !== "All types") {
      results = results.filter(
        (property) => String(property.type).toLowerCase() === type.toLowerCase(),
      );
    }

    if (bedrooms !== "Any") {
      const minimumBedrooms = Number(bedrooms);

      results = results.filter((property) =>
        minimumBedrooms === 4
          ? Number(property.bedrooms) >= 4
          : Number(property.bedrooms) === minimumBedrooms,
      );
    }

    if (maxPrice !== "Any budget") {
      results = results.filter(
        (property) => Number(property.price) <= Number(maxPrice),
      );
    }

    if (sort === "price-low") {
      results.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      results.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      results.sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
    }

    return results;
  }, [properties, search, location, type, bedrooms, maxPrice, sort]);

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setType("All types");
    setBedrooms("Any");
    setMaxPrice("Any budget");
    setSort("recommended");
  };

  const toggleFavorite = (id) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  return (
    <div className="rento-rent-page">
      <Navbar />

      <section className="rent-hero">
        <div className="rent-hero-image" />
        <div className="rent-hero-overlay" />

        <div className="rent-hero-content">
          <div className="rent-eyebrow">
            <span className="rent-eyebrow-line" />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <h1>
            Find a place
            <br />
            <span>to call home.</span>
          </h1>

          <p className="rent-hero-description">
            Discover beautiful homes, apartments, and spaces for rent.
            Your next home is closer than you think.
          </p>

          <div className="rent-hero-points">
            <span>
              <ShieldCheck size={16} /> Explore available listings
            </span>
            <span>
              <KeyRound size={16} /> Find your next home
            </span>
          </div>

          <form
            className="rent-search-panel"
            onSubmit={(event) => {
              event.preventDefault();
              document
                .getElementById("rent-listings")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <label className="rent-search-field">
              <span className="rent-field-icon">
                <MapPin size={19} />
              </span>
              <span className="rent-field-content">
                <span className="rent-field-label">LOCATION</span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, area or neighbourhood"
                />
              </span>
            </label>

            <div className="rent-search-divider" />

            <label className="rent-search-field rent-type-field">
              <span className="rent-field-icon">
                <House size={19} />
              </span>
              <span className="rent-field-content">
                <span className="rent-field-label">PROPERTY TYPE</span>
                <select value={type} onChange={(event) => setType(event.target.value)}>
                  <option>All types</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Duplex</option>
                  <option>Studio</option>
                  <option>Flat</option>
                </select>
              </span>
              <ChevronDown className="rent-select-chevron" size={15} />
            </label>

            <button type="submit" className="rent-search-button">
              <Search size={19} />
              <span>Find a home</span>
            </button>
          </form>

          <div className="rent-hero-bottom">
            <span>MADE FOR THE WAY YOU WANT TO LIVE</span>
            <span className="rent-hero-scroll">
              SCROLL TO EXPLORE <span>↓</span>
            </span>
          </div>
        </div>
      </section>

      <section className="rent-intro-section">
        <div className="rent-section-kicker">
          <Sparkles size={15} /> FIND YOUR SPACE
        </div>
        <div className="rent-intro-grid">
          <h2>
            A better way
            <br />
            to find <span>your home.</span>
          </h2>
          <p>
            From your first apartment to the home your family has been
            dreaming of, explore rental spaces that fit your life, plans,
            and budget.
          </p>
        </div>

        <div className="rent-benefits">
          <div className="rent-benefit">
            <span className="rent-benefit-icon">
              <Search size={20} />
            </span>
            <div>
              <strong>Search your way</strong>
              <p>Find homes by location, type, and budget.</p>
            </div>
          </div>
          <div className="rent-benefit">
            <span className="rent-benefit-icon">
              <Building2 size={20} />
            </span>
            <div>
              <strong>Explore your options</strong>
              <p>Browse a variety of available property types.</p>
            </div>
          </div>
          <div className="rent-benefit">
            <span className="rent-benefit-icon">
              <Heart size={20} />
            </span>
            <div>
              <strong>Keep your favourites</strong>
              <p>Save the listings you want to revisit.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rent-listings-section" id="rent-listings">
        <div className="rent-listings-top">
          <div>
            <div className="rent-section-kicker">
              <span className="rent-kicker-dot" /> THE RENT COLLECTION
            </div>
            <h2>
              Homes worth <span>coming home to.</span>
            </h2>
            <p className="rent-listings-subtitle">
              Explore spaces that could be your next address.
            </p>
          </div>

          <div className="rent-results-count">
            <strong>{filteredProperties.length.toString().padStart(2, "0")}</strong>
            <span>PROPERTIES</span>
          </div>
        </div>

        <div className="rent-toolbar">
          <label className="rent-toolbar-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search homes, areas, or keywords..."
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </label>

          <div className="rent-toolbar-actions">
            <button
              type="button"
              className={`rent-filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((value) => !value)}
            >
              <SlidersHorizontal size={17} />
              Filters
              <ChevronDown size={15} />
            </button>

            <label className="rent-sort-select">
              <span>Sort:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        {showFilters && (
          <div className="rent-filter-panel">
            <label>
              <span>Property type</span>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option>All types</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Duplex</option>
                <option>Studio</option>
                <option>Flat</option>
              </select>
            </label>

            <label>
              <span>Bedrooms</span>
              <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}>
                <option value="Any">Any number</option>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3">3 bedrooms</option>
                <option value="4">4+ bedrooms</option>
              </select>
            </label>

            <label>
              <span>Maximum yearly price</span>
              <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
                <option>Any budget</option>
                <option value="1000000">₦1,000,000</option>
                <option value="2000000">₦2,000,000</option>
                <option value="3000000">₦3,000,000</option>
                <option value="5000000">₦5,000,000</option>
                <option value="10000000">₦10,000,000</option>
              </select>
            </label>

            <button type="button" className="rent-reset-button" onClick={resetFilters}>
              <RotateCcw size={15} /> Reset filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="rent-loading-state">
            <span className="rent-loading-spinner" />
            <p>Finding homes for you...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="rent-property-grid">
            {filteredProperties.map((property, index) => (
              <article
                className="rent-property-card"
                key={property.id}
                style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
              >
                <Link
                  to={`/property/${property.id}`}
                  className="rent-property-image-link"
                  aria-label={`View ${property.title}`}
                >
                  <img
                    className="rent-property-image"
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85";
                    }}
                  />
                  <span className="rent-property-type">{property.type}</span>
                  {property.featured && (
                    <span className="rent-featured-tag">
                      <Sparkles size={12} /> FEATURED
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  className={`rent-favorite-button ${
                    favorites.includes(property.id) ? "is-favorite" : ""
                  }`}
                  onClick={() => toggleFavorite(property.id)}
                  aria-label={
                    favorites.includes(property.id)
                      ? "Remove from favourites"
                      : "Add to favourites"
                  }
                >
                  <Heart
                    size={18}
                    fill={favorites.includes(property.id) ? "currentColor" : "none"}
                  />
                </button>

                <div className="rent-property-body">
                  <div className="rent-property-location">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                  </div>

                  <Link
                    to={`/property/${property.id}`}
                    className="rent-property-title"
                  >
                    {property.title}
                  </Link>

                  <div className="rent-property-specs">
                    <span>
                      <BedDouble size={16} />
                      {property.bedrooms || "—"} beds
                    </span>
                    <span>
                      <Bath size={16} />
                      {property.bathrooms || "—"} baths
                    </span>
                    <span>
                      <Maximize size={15} />
                      {property.area ? `${property.area} sqm` : "Size on request"}
                    </span>
                  </div>

                  <div className="rent-card-bottom">
                    <div className="rent-card-price">
                      <strong>{formatPrice(property.price)}</strong>
                      <span>{property.period || "per year"}</span>
                    </div>
                    <Link
                      to={`/property/${property.id}`}
                      className="rent-card-arrow"
                      aria-label={`View details for ${property.title}`}
                    >
                      <ArrowUpRight size={20} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rent-empty-state">
            <span className="rent-empty-icon">
              <House size={30} />
            </span>
            <h3>No matching homes found</h3>
            <p>
              Try another location or clear your filters to explore more
              available properties.
            </p>
            <button type="button" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}

        {!loading && (
          <div className="rent-listings-footer">
            <span>YOUR NEXT ADDRESS COULD BE HERE.</span>
            <span>
              Showing {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}
            </span>
          </div>
        )}
      </section>

      <section className="rent-cta-section">
        <div className="rent-cta-decoration" />
        <div className="rent-cta-content">
          <span className="rent-cta-kicker">HAVE A PROPERTY TO RENT?</span>
          <h2>
            Your property.
            <br />
            <span>The right audience.</span>
          </h2>
          <p>
            List your rental property on RENTO and help someone discover
            their next home.
          </p>
          <Link to="/list-property" className="rent-cta-button">
            List your property <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="rent-cta-symbol">
          <House size={104} strokeWidth={0.8} />
          <span>RENTO</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Rent;
