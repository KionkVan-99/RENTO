import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Heart,
  House,
  LandPlot,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { properties } from "../data/properties";

function Home() {
  const [liked, setLiked] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchType, setSearchType] = useState("Buy");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 180);

    return () => clearTimeout(timer);
  }, []);

  const toggleLike = (id) => {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const featuredProperties = properties
    .filter((property) => property.featured)
    .slice(0, 6);

  const stats = [
    {
      number: "500+",
      label: "Properties",
      icon: Building2,
    },
    {
      number: "17+",
      label: "Locations",
      icon: MapPin,
    },
    {
      number: "100+",
      label: "Property owners",
      icon: Users,
    },
    {
      number: "24/7",
      label: "Property discovery",
      icon: TrendingUp,
    },
  ];

  const searchRoute =
    searchType === "Rent"
      ? "/rent"
      : searchType === "Land"
        ? "/land"
        : "/buy";

  return (
    <div className="rento-app">
      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="home-hero">
          <div className="home-hero-bg" />
          <div className="home-hero-noise" />

          <div className="home-hero-glow glow-one" />
          <div className="home-hero-glow glow-two" />

          <div className="home-hero-content page-container">
            <div className={`hero-kicker ${loaded ? "hero-enter" : ""}`}>
              <span className="pulse-dot" />
              RENTO / PROPERTY MARKETPLACE
            </div>

            <h1 className={loaded ? "hero-enter hero-title" : "hero-title"}>
              Find the place
              <span>that feels right.</span>
            </h1>

            <p
              className={`hero-copy ${loaded ? "hero-enter hero-delay-1" : ""}`}
            >
              Discover homes, apartments, land and property opportunities
              while connecting directly with owners and agents.
            </p>

            <div
              className={`hero-actions ${
                loaded ? "hero-enter hero-delay-2" : ""
              }`}
            >
              <Link to="/buy" className="gold-button">
                Explore properties
                <ArrowRight size={18} />
              </Link>

              <Link to="/list-property" className="ghost-button">
                List a property
              </Link>
            </div>

            {/* SEARCH */}
            <div
              className={`hero-search-panel ${
                loaded ? "hero-enter hero-delay-3" : ""
              }`}
            >
              <div className="search-panel-label">
                <Search size={15} />
                START YOUR SEARCH
              </div>

              <div className="search-mode-tabs">
                {["Buy", "Rent", "Land"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={searchType === type ? "active" : ""}
                    onClick={() => setSearchType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="hero-search-grid">
                <div className="hero-search-field">
                  <MapPin size={19} />

                  <div>
                    <small>Location</small>

                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(event) =>
                        setSearchLocation(event.target.value)
                      }
                      placeholder="Anywhere in Nigeria"
                    />
                  </div>
                </div>

                <div className="hero-search-field">
                  <Building2 size={19} />

                  <div>
                    <small>Looking for</small>

                    <strong>
                      {searchType === "Buy"
                        ? "Homes & properties"
                        : searchType === "Rent"
                          ? "Rental properties"
                          : "Land & plots"}
                    </strong>
                  </div>
                </div>

                <Link to={searchRoute} className="hero-search-submit">
                  Search marketplace
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* PROOF */}
            <div className="hero-proof">
              <div className="proof-avatars">
                <span>R</span>
                <span>E</span>
                <span>N</span>
                <span>T</span>
                <span>O</span>
              </div>

              <div>
                <div className="proof-stars">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star
                      key={item}
                      size={13}
                      fill="currentColor"
                    />
                  ))}
                </div>

                <span>Built around easier property discovery</span>
              </div>
            </div>
          </div>

          <div className="hero-side-note">
            <span>01</span>
            <div />
            <span>DISCOVER / CONNECT</span>
          </div>

          <div className="hero-scroll-indicator">
            <span>SCROLL TO EXPLORE</span>
            <div />
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}
        <section className="stats-strip">
          <div className="page-container stats-grid-new">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  className={`stat-card-new ${
                    loaded ? "is-visible" : ""
                  }`}
                  style={{
                    "--delay": `${index * 100}ms`,
                  }}
                  key={stat.label}
                >
                  <div className="stat-card-icon">
                    <Icon size={19} />
                  </div>

                  <div>
                    <strong>{stat.number}</strong>
                    <span>{stat.label}</span>
                  </div>

                  <small>0{index + 1}</small>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            INTRO
        ===================================================== */}
        <section className="home-section split-intro">
          <div className="page-container split-intro-grid">
            <div className="section-marker">
              <span>01</span>
              <div />
              <span>THE RENTO IDEA</span>
            </div>

            <div>
              <span className="gold-eyebrow">
                ONE MARKETPLACE. TWO SIDES.
              </span>

              <h2 className="display-heading">
                A better way to
                <span>move through property.</span>
              </h2>

              <p className="section-copy">
                RENTO brings people looking for property and people with
                property together in one focused experience.
              </p>
            </div>
          </div>

          <div className="page-container audience-grid">
            <Link
              to="/buy"
              className="audience-card seeker-card"
            >
              <div className="audience-image" />
              <div className="audience-shade" />

              <div className="audience-content">
                <div className="round-icon">
                  <Search size={21} />
                </div>

                <span>FOR PROPERTY SEEKERS</span>

                <h3>
                  I'm looking
                  <br />
                  for a property.
                </h3>

                <p>
                  Search listings, compare details and discover your next
                  opportunity.
                </p>

                <b>
                  Explore marketplace
                  <ArrowRight size={17} />
                </b>
              </div>
            </Link>

            <Link
              to="/list-property"
              className="audience-card owner-card"
            >
              <div className="audience-image" />
              <div className="audience-shade" />

              <div className="audience-content">
                <div className="round-icon">
                  <House size={21} />
                </div>

                <span>FOR PROPERTY OWNERS</span>

                <h3>
                  I have
                  <br />
                  a property.
                </h3>

                <p>
                  Put your property in front of people actively searching
                  for their next place.
                </p>

                <b>
                  List your property
                  <ArrowRight size={17} />
                </b>
              </div>
            </Link>
          </div>
        </section>

        {/* =====================================================
            FEATURED PROPERTIES
        ===================================================== */}
        <section className="home-section featured-home">
          <div className="page-container">
            <div className="section-topline">
              <div>
                <span className="gold-eyebrow">
                  CURATED FOR YOU
                </span>

                <h2 className="section-title">
                  Properties worth
                  <br />
                  <span>a closer look.</span>
                </h2>
              </div>

              <Link to="/buy" className="text-link">
                View all listings
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="featured-grid">
              {featuredProperties.map((property, index) => (
                <article
                  className="home-property-card"
                  key={property.id}
                  style={{
                    "--delay": `${index * 80}ms`,
                  }}
                >
                  <Link
                    to={`/property/${property.id}`}
                    className="home-property-image"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      loading="lazy"
                    />

                    <div className="image-shade" />

                    <span className="property-pill">
                      {property.type}
                    </span>

                    <div className="property-number">
                      0{index + 1}
                    </div>
                  </Link>

                  <button
                    type="button"
                    className={`save-property ${
                      liked.includes(property.id)
                        ? "liked"
                        : ""
                    }`}
                    onClick={() => toggleLike(property.id)}
                    aria-label={
                      liked.includes(property.id)
                        ? "Remove from saved properties"
                        : "Save property"
                    }
                  >
                    <Heart
                      size={18}
                      fill={
                        liked.includes(property.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <div className="home-property-body">
                    <div className="property-heading-row">
                      <div>
                        <h3>{property.title}</h3>

                        <span>
                          <MapPin size={14} />
                          {property.location}
                        </span>
                      </div>

                      <strong>
                        ₦{property.price.toLocaleString()}
                      </strong>
                    </div>

                    <div className="property-details">
                      <span>
                        <BedDouble size={15} />
                        {property.bedrooms}
                      </span>

                      <span>
                        <Building2 size={15} />
                        {property.bathrooms}
                      </span>

                      {property.area && (
                        <span>{property.area}</span>
                      )}

                      <Link to={`/property/${property.id}`}>
                        View
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            PROPERTY TYPES
        ===================================================== */}
        <section className="home-section types-modern">
          <div className="page-container">
            <div className="section-topline">
              <div>
                <span className="gold-eyebrow">
                  EXPLORE BY TYPE
                </span>

                <h2 className="section-title">
                  Choose the kind
                  <br />
                  <span>of property.</span>
                </h2>
              </div>

              <p className="section-side-copy">
                From a new home to a piece of land, RENTO gives every
                search a place to start.
              </p>
            </div>

            <div className="modern-type-grid">
              <Link to="/buy" className="modern-type-card">
                <div className="type-number">01</div>

                <Building2 size={32} />

                <h3>
                  Homes &
                  <br />
                  Apartments
                </h3>

                <p>
                  Spaces for living, buying and building your next
                  chapter.
                </p>

                <ArrowRight size={19} />
              </Link>

              <Link to="/rent" className="modern-type-card">
                <div className="type-number">02</div>

                <House size={32} />

                <h3>
                  Rental
                  <br />
                  Properties
                </h3>

                <p>
                  Find a place that matches your needs, location and
                  budget.
                </p>

                <ArrowRight size={19} />
              </Link>

              <Link to="/land" className="modern-type-card">
                <div className="type-number">03</div>

                <LandPlot size={32} />

                <h3>
                  Land &
                  <br />
                  Plots
                </h3>

                <p>
                  Explore land for homes, business and future
                  opportunities.
                </p>

                <ArrowRight size={19} />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            PROCESS
        ===================================================== */}
        <section className="process-section">
          <div className="page-container">
            <div className="process-layout">
              <div>
                <span className="gold-eyebrow">
                  HOW RENTO WORKS
                </span>

                <h2 className="display-heading">
                  Simple steps.
                  <br />
                  <span>Real possibilities.</span>
                </h2>

                <p className="section-copy">
                  The journey from “I'm looking” to “I found it”
                  should not feel complicated.
                </p>

                <Link to="/buy" className="gold-button">
                  Start exploring
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="process-list">
                <div className="process-item">
                  <span>01</span>

                  <div className="process-icon">
                    <Search size={22} />
                  </div>

                  <div>
                    <h3>Search</h3>
                    <p>
                      Tell RENTO what kind of property you want to
                      discover.
                    </p>
                  </div>
                </div>

                <div className="process-item">
                  <span>02</span>

                  <div className="process-icon">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <h3>Explore</h3>
                    <p>
                      Look through useful details, images, pricing
                      and location.
                    </p>
                  </div>
                </div>

                <div className="process-item">
                  <span>03</span>

                  <div className="process-icon">
                    <CheckCircle2 size={22} />
                  </div>

                  <div>
                    <h3>Connect</h3>
                    <p>
                      Move from a listing to the owner or agent
                      behind it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY RENTO
        ===================================================== */}
        <section className="why-modern-section">
          <div className="page-container why-modern-grid">
            <div className="why-copy">
              <span className="gold-eyebrow">
                WHY RENTO?
              </span>

              <h2 className="display-heading">
                Property discovery
                <br />
                <span>should feel clear.</span>
              </h2>

              <p className="section-copy">
                RENTO is designed around the actual journey: discover
                useful listings, understand what you're seeing and
                connect with the person behind the property.
              </p>

              <div className="why-points">
                <div>
                  <div>
                    <Search size={18} />
                  </div>

                  <span>
                    <b>Search with less stress</b>
                    <small>
                      Find by location, property type and budget.
                    </small>
                  </span>
                </div>

                <div>
                  <div>
                    <ShieldCheck size={18} />
                  </div>

                  <span>
                    <b>Useful information</b>
                    <small>
                      See the details that matter before reaching
                      out.
                    </small>
                  </span>
                </div>

                <div>
                  <div>
                    <Users size={18} />
                  </div>

                  <span>
                    <b>One place to connect</b>
                    <small>
                      Bring seekers, owners and agents together.
                    </small>
                  </span>
                </div>
              </div>
            </div>

            <div className="why-visual">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />

              <div className="why-core">
                <Sparkles size={27} />
                <span>RENTO.</span>
                <small>DISCOVER / CONNECT</small>
              </div>

              <div className="floating-data data-one">
                <Building2 size={16} />
                Homes
              </div>

              <div className="floating-data data-two">
                <LandPlot size={16} />
                Land
              </div>

              <div className="floating-data data-three">
                <MapPin size={16} />
                Nigeria
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}
        <section className="final-home-cta">
          <div className="cta-glow" />

          <div className="page-container final-cta-inner">
            <span className="gold-eyebrow">
              READY WHEN YOU ARE
            </span>

            <h2>
              There is a place
              <br />
              <span>waiting to be found.</span>
            </h2>

            <p>
              Explore properties or put yours in front of people
              looking for their next opportunity.
            </p>

            <div>
              <Link to="/buy" className="gold-button">
                Explore properties
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/list-property"
                className="ghost-button"
              >
                List a property
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;