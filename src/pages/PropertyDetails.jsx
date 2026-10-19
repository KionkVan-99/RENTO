import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  Heart,
  Home,
  MapPin,
  Maximize,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Send,
  Clock,
} from "lucide-react";

const API_BASE_URL = "https://rento-api-rime.onrender.com";
const API_URL = `${API_BASE_URL}/api`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85";

const getImageUrl = (image) => {
  if (!image) {
    return FALLBACK_IMAGE;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/${image}`;
};

const PropertyDetails = () => {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);

  const [modal, setModal] = useState(null);

  // MESSAGE
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState("");

  // VISIT
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");

  // ======================================================
  // FETCH PROPERTY
  // ======================================================

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/properties/${id}`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Property could not be found.");
        }

        setProperty(data.property);
      } catch (err) {
        console.error("Property fetch error:", err);

        setError(
          err.message || "Something went wrong while loading the property.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // ======================================================
  // LOAD SAVED PROPERTY
  // ======================================================

  useEffect(() => {
    if (!id) return;

    try {
      const savedProperties =
        JSON.parse(localStorage.getItem("rento_saved_properties")) || [];

      setSaved(savedProperties.includes(String(id)));
    } catch (error) {
      console.error("Saved property error:", error);
      setSaved(false);
    }
  }, [id]);

  // ======================================================
  // SAVE PROPERTY
  // ======================================================

  const toggleSaved = () => {
    try {
      const savedProperties =
        JSON.parse(localStorage.getItem("rento_saved_properties")) || [];

      const propertyId = String(id);

      let updatedProperties;

      if (savedProperties.includes(propertyId)) {
        updatedProperties = savedProperties.filter(
          (item) => item !== propertyId,
        );

        setSaved(false);
      } else {
        updatedProperties = [...savedProperties, propertyId];

        setSaved(true);
      }

      localStorage.setItem(
        "rento_saved_properties",
        JSON.stringify(updatedProperties),
      );
    } catch (error) {
      console.error("Unable to save property:", error);
    }
  };

  // ======================================================
  // SHARE PROPERTY
  // ======================================================

  const handleShare = async () => {
    const shareData = {
      title: property?.title || "RENTO Property",
      text: `Check out this property on RENTO: ${
        property?.title || "Property"
      }`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);

        alert("Property link copied!");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    setModal(null);

    setMessage("");
    setSenderName("");
    setSenderEmail("");
    setSenderPhone("");

    setVisitDate("");
    setVisitTime("");

    setMessageError("");
    setMessageLoading(false);
  };

  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!senderName.trim()) {
      setMessageError("Please enter your name.");
      return;
    }

    if (!senderPhone.trim() && !senderEmail.trim()) {
      setMessageError("Please provide your phone number or email.");
      return;
    }

    if (!message.trim()) {
      setMessageError("Please enter a message.");
      return;
    }

    try {
      setMessageLoading(true);
      setMessageError("");

      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: Number(id),
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim() || null,
          senderPhone: senderPhone.trim() || null,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send your message.");
      }

      alert("Your message has been sent successfully!");

      closeModal();
    } catch (error) {
      console.error("Message sending error:", error);

      setMessageError(
        error.message || "Something went wrong while sending your message.",
      );
    } finally {
      setMessageLoading(false);
    }
  };

  // ======================================================
  // SCHEDULE VISIT
  // ======================================================

  const handleScheduleVisit = (event) => {
    event.preventDefault();

    if (!visitDate || !visitTime) {
      return;
    }

    alert(`Inspection request selected for ${visitDate} at ${visitTime}.`);

    closeModal();
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="property-details-page">
        <div className="property-loading">
          <div className="loading-spinner" />

          <p>Loading property...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error || !property) {
    return (
      <div className="property-details-page">
        <div className="property-error">
          <div className="error-icon">
            <Home size={30} />
          </div>

          <h2>Property not found</h2>

          <p>
            {error || "The property you're looking for may have been removed."}
          </p>

          <Link to="/buy" className="back-button">
            <ArrowLeft size={18} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // PROPERTY IMAGES
  // ======================================================

  const propertyImages =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : property.image
        ? [property.image]
        : [FALLBACK_IMAGE];

  const images = propertyImages.map(getImageUrl);

  // ======================================================
  // FEATURES
  // ======================================================

  const features = [
    property.bedrooms > 0 && {
      icon: <BedDouble size={20} />,
      label: "Bedrooms",
      value: property.bedrooms,
    },

    property.bathrooms > 0 && {
      icon: <Bath size={20} />,
      label: "Bathrooms",
      value: property.bathrooms,
    },

    property.parkingSpaces > 0 && {
      icon: <Car size={20} />,
      label: "Parking",
      value: property.parkingSpaces,
    },

    property.area > 0 && {
      icon: <Maximize size={20} />,
      label: "Property Size",
      value: `${Number(property.area).toLocaleString()} ${
        property.landUnit || "sqm"
      }`,
    },
  ].filter(Boolean);

  // ======================================================
  // FORMAT PRICE
  // ======================================================

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "Price on request";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price on request";
    }

    return `₦${numericPrice.toLocaleString()}`;
  };

  // ======================================================
  // LISTING TYPE
  // ======================================================

  const listingType = property.listingType?.toLowerCase();

  const listingLabel =
    listingType === "rent"
      ? "For Rent"
      : listingType === "buy"
        ? "For Sale"
        : property.listingType || "For Sale";

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="property-details-page">
      <div className="details-container">
        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div className="details-topbar">
          <Link to="/buy" className="back-link">
            <ArrowLeft size={18} />
            Back to Properties
          </Link>

          <div className="top-actions">
            <button
              type="button"
              className={`icon-action ${saved ? "saved" : ""}`}
              onClick={toggleSaved}
              aria-label={saved ? "Remove saved property" : "Save property"}
            >
              <Heart size={19} fill={saved ? "currentColor" : "none"} />
            </button>

            <button
              type="button"
              className="icon-action"
              onClick={handleShare}
              aria-label="Share property"
            >
              <Share2 size={19} />
            </button>
          </div>
        </div>

        {/* ==================================================
            GALLERY
        ================================================== */}

        <section className="property-gallery">
          <div className="main-property-image">
            <img
              src={images[activeImage]}
              alt={property.title || "Property"}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="image-counter">
              {activeImage + 1} / {images.length}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-prev"
                  onClick={() =>
                    setActiveImage(
                      activeImage === 0 ? images.length - 1 : activeImage - 1,
                    )
                  }
                  aria-label="Previous image"
                >
                  <ArrowLeft size={20} />
                </button>

                <button
                  type="button"
                  className="gallery-arrow gallery-next"
                  onClick={() =>
                    setActiveImage(
                      activeImage === images.length - 1 ? 0 : activeImage + 1,
                    )
                  }
                  aria-label="Next image"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="property-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ==================================================
            PROPERTY HEADER
        ================================================== */}

        <section className="property-header">
          <div className="property-heading">
            <div className="property-status">
              <CheckCircle2 size={15} />
              Available
            </div>

            <h1>{property.title || "Luxury Property"}</h1>

            <div className="property-location">
              <MapPin size={18} />

              <span>
                {property.city || property.location || "Location unavailable"}

                {property.state ? `, ${property.state}` : ""}
              </span>
            </div>
          </div>

          <div className="property-price">
            <span>{formatPrice(property.price)}</span>

            {listingType === "rent" && <small>/ year</small>}
          </div>
        </section>

        {/* ==================================================
            FEATURES
        ================================================== */}

        {features.length > 0 && (
          <section className="property-features">
            {features.map((feature, index) => (
              <div className="feature-box" key={index}>
                <div className="feature-icon">{feature.icon}</div>

                <div>
                  <span>{feature.label}</span>

                  <strong>{feature.value}</strong>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="property-content-grid">
          <main className="property-main">
            {/* ABOUT */}

            <section className="details-section">
              <div className="section-heading">
                <Sparkles size={19} />

                <h2>About this property</h2>
              </div>

              <p className="property-description">
                {property.description ||
                  "This property offers a comfortable and modern living experience with quality finishes and a well-planned layout."}
              </p>
            </section>

            {/* INFORMATION */}

            <section className="details-section">
              <div className="section-heading">
                <Home size={19} />

                <h2>Property information</h2>
              </div>

              <div className="information-grid">
                <div>
                  <span>Property type</span>

                  <strong>
                    {property.propertyType || property.type || "Residential"}
                  </strong>
                </div>

                <div>
                  <span>Listing type</span>

                  <strong>{listingLabel}</strong>
                </div>

                <div>
                  <span>Condition</span>

                  <strong>{property.condition || "Excellent Condition"}</strong>
                </div>

                <div>
                  <span>State</span>

                  <strong>{property.state || "Not specified"}</strong>
                </div>

                <div>
                  <span>City / Location</span>

                  <strong>
                    {property.city || property.location || "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Listed</span>

                  <strong>
                    {property.createdAt
                      ? new Date(property.createdAt).toLocaleDateString()
                      : "Recently"}
                  </strong>
                </div>
              </div>
            </section>

            {/* AMENITIES */}

            {Array.isArray(property.amenities) &&
              property.amenities.length > 0 && (
                <section className="details-section">
                  <div className="section-heading">
                    <ShieldCheck size={19} />

                    <h2>Features & amenities</h2>
                  </div>

                  <div className="amenities-grid">
                    {property.amenities.map((amenity, index) => (
                      <div className="amenity" key={index}>
                        <CheckCircle2 size={17} />

                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </main>

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="property-sidebar">
            <div className="property-sidebar-sticky">
              {/* CONTACT CARD */}

              <div className="contact-card">
                <div className="contact-card-top">
                  <span>Interested in this property?</span>

                  <h3>Contact the owner</h3>
                </div>

                <div className="owner-profile">
                  <div className="owner-avatar">
                    <UserRound size={23} />
                  </div>

                  <div>
                    <strong>{property.ownerName || "Property Owner"}</strong>

                    <span>Verified listing owner</span>
                  </div>
                </div>

                <div className="verified-owner">
                  <ShieldCheck size={16} />

                  <span>Verified on RENTO</span>
                </div>

                <button
                  type="button"
                  className="contact-button"
                  onClick={() => setModal("contact")}
                >
                  <Phone size={18} />
                  Contact Owner
                </button>

                <button
                  type="button"
                  className="message-button"
                  onClick={() => {
                    setMessageError("");
                    setModal("message");
                  }}
                >
                  Send a Message
                  <ArrowRight size={17} />
                </button>

                <p className="safety-note">
                  Never send money before properly inspecting a property and
                  verifying the owner or agent.
                </p>
              </div>

              {/* SCHEDULE */}

              <div className="schedule-card">
                <CalendarDays size={20} />

                <div>
                  <strong>Want to see it?</strong>

                  <p>Arrange a property inspection.</p>
                </div>

                <button type="button" onClick={() => setModal("schedule")}>
                  Schedule Visit
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ====================================================
          MODALS
      ==================================================== */}

      {modal && (
        <div className="property-modal-overlay" onClick={closeModal}>
          <div
            className="property-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* ==================================================
                CONTACT OWNER
            ================================================== */}

            {modal === "contact" && (
              <>
                <div className="modal-icon">
                  <Phone size={22} />
                </div>

                <span className="modal-label">PROPERTY OWNER</span>

                <h2>Contact Owner</h2>

                <p>You're interested in:</p>

                <strong className="modal-property-name">
                  {property.title}
                </strong>

                <div className="modal-owner">
                  <div className="owner-avatar">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <strong>{property.ownerName || "Property Owner"}</strong>

                    <span>Verified RENTO listing</span>
                  </div>
                </div>

                {property.ownerPhone ? (
                  <a
                    href={`tel:${property.ownerPhone}`}
                    className="modal-primary-button"
                  >
                    <Phone size={18} />
                    Call Owner
                  </a>
                ) : (
                  <button
                    type="button"
                    className="modal-primary-button"
                    onClick={() => setModal("message")}
                  >
                    <Send size={18} />
                    Send a Message
                  </button>
                )}
              </>
            )}

            {/* ==================================================
                SEND MESSAGE
            ================================================== */}

            {modal === "message" && (
              <form onSubmit={handleSendMessage}>
                <div className="modal-icon">
                  <Send size={22} />
                </div>

                <span className="modal-label">RENTO MESSAGES</span>

                <h2>Send a Message</h2>

                <p>
                  Contact the owner about <strong>{property.title}</strong>.
                </p>

                {messageError && (
                  <div className="modal-error">{messageError}</div>
                )}

                <label className="modal-field">
                  <span>Your name</span>

                  <input
                    type="text"
                    value={senderName}
                    onChange={(event) => setSenderName(event.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="modal-field">
                  <span>Email</span>

                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(event) => setSenderEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>

                <label className="modal-field">
                  <span>Phone number</span>

                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(event) => setSenderPhone(event.target.value)}
                    placeholder="08012345678"
                    autoComplete="tel"
                  />
                </label>

                <label className="modal-field">
                  <span>Your message</span>

                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Hi, I'm interested in this property. I'd like to know more..."
                    rows={5}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="modal-primary-button"
                  disabled={messageLoading}
                >
                  <Send size={18} />

                  {messageLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}

            {/* ==================================================
                SCHEDULE VISIT
            ================================================== */}

            {modal === "schedule" && (
              <form onSubmit={handleScheduleVisit}>
                <div className="modal-icon">
                  <CalendarDays size={22} />
                </div>

                <span className="modal-label">PROPERTY INSPECTION</span>

                <h2>Schedule a Visit</h2>

                <p>
                  Choose when you'd like to inspect{" "}
                  <strong>{property.title}</strong>.
                </p>

                <label className="modal-field">
                  <span>Date</span>

                  <input
                    type="date"
                    value={visitDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setVisitDate(event.target.value)}
                    required
                  />
                </label>

                <label className="modal-field">
                  <span>Preferred time</span>

                  <select
                    value={visitTime}
                    onChange={(event) => setVisitTime(event.target.value)}
                    required
                  >
                    <option value="">Select a time</option>

                    <option value="9:00 AM">9:00 AM</option>

                    <option value="11:00 AM">11:00 AM</option>

                    <option value="1:00 PM">1:00 PM</option>

                    <option value="3:00 PM">3:00 PM</option>

                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </label>

                <div className="visit-note">
                  <Clock size={15} />

                  <span>Your request will be sent to the property owner.</span>
                </div>

                <button type="submit" className="modal-primary-button">
                  <CalendarDays size={18} />
                  Request Inspection
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
