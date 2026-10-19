import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Car,
  CheckCircle2,
  FileText,
  Home,
  ImagePlus,
  LandPlot,
  MapPin,
  Upload,
  X,
} from "lucide-react";

const API_URL = "https://rento-api-rime.onrender.come.onrender.come.onrender.come.onrender.com";

function ListProperty() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "house",
    listingType: "rent",
    price: "",
    location: "",
    city: "",
    state: "",
    bedrooms: "",
    bathrooms: "",
    parkingSpaces: "",
    area: "",
    landUnit: "",
    landPurpose: "",
    negotiable: false,
    amenities: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
  });

  const token = localStorage.getItem("rentoToken");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      setUploadingImages(true);
      setError("");

      const uploadedImages = [];

      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("image", file);

        const response = await fetch(`${API_URL}/api/upload/image`, {
          method: "POST",
          body: uploadData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Image upload failed.");
        }

        if (data.url) {
          uploadedImages.push(data.url);
        } else if (data.imageUrl) {
          uploadedImages.push(data.imageUrl);
        }
      }

      setImages((prev) => [...prev, ...uploadedImages]);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================================================
  // DOCUMENT UPLOAD
  // ======================================================

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      setError("");

      const uploadedDocuments = [];

      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("document", file);

        const response = await fetch(`${API_URL}/api/upload/document`, {
          method: "POST",
          body: uploadData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Document upload failed.");
        }

        if (data.url) {
          uploadedDocuments.push(data.url);
        } else if (data.documentUrl) {
          uploadedDocuments.push(data.documentUrl);
        }
      }

      setDocuments((prev) => [...prev, ...uploadedDocuments]);
    } catch (err) {
      console.error("Document upload error:", err);
      setError(err.message || "Failed to upload document.");
    }
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================================================
  // SUBMIT PROPERTY
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("You must be logged in as an agent to list a property.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a property title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a property description.");
      return;
    }

    if (!formData.price) {
      setError("Please enter the property price.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter the property location.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,

        price: Number(formData.price),

        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,

        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,

        parkingSpaces: formData.parkingSpaces
          ? Number(formData.parkingSpaces)
          : null,

        area: formData.area ? Number(formData.area) : null,

        images,
        documents,

        amenities: formData.amenities
          ? formData.amenities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      const response = await fetch(`${API_URL}/api/properties`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // ==================================================
      // PLAN LIMIT REACHED
      // ==================================================

      if (response.status === 403 && data.code === "PLAN_LIMIT_REACHED") {
        setError(
          data.message ||
            "You have reached your current plan's property limit.",
        );

        setTimeout(() => {
          navigate("/plans");
        }, 1500);

        return;
      }

      // ==================================================
      // OTHER ERRORS
      // ==================================================

      if (!response.ok) {
        throw new Error(data.message || "Failed to create property.");
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      setSuccess(
        "Property listed successfully! Redirecting to your dashboard...",
      );

      setTimeout(() => {
        navigate("/agent");
      }, 1500);
    } catch (err) {
      console.error("Create property error:", err);

      setError(
        err.message || "Something went wrong while creating the property.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-property-page">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="list-property-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <span className="eyebrow">RENTO MARKETPLACE</span>

          <h1>List Your Property</h1>

          <p>
            Add your property to RENTO and connect with people looking for their
            next home or investment.
          </p>
        </div>
      </div>

      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (
        <div className="form-alert error">
          <X size={20} />

          <div>
            <strong>Unable to list property</strong>
            <p>{error}</p>

            {error.toLowerCase().includes("plan") && (
              <button type="button" onClick={() => navigate("/plans")}>
                View Plans <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="form-alert success">
          <CheckCircle2 size={20} />

          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="list-property-layout">
          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="property-form-main">
            {/* BASIC INFORMATION */}

            <section className="form-card">
              <div className="section-heading">
                <div className="section-icon">
                  <Home size={20} />
                </div>

                <div>
                  <h2>Property Information</h2>
                  <p>Tell potential buyers or renters about the property.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Listing title</label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Luxury 3 Bedroom Apartment"
                  />
                </div>

                <div className="form-group full">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="7"
                    placeholder="Describe the property, its condition, location, features and anything important..."
                  />
                </div>

                <div className="form-group">
                  <label>Property type</label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="flat">Flat</option>
                    <option value="duplex">Duplex</option>
                    <option value="land">Land</option>
                    <option value="office">Office</option>
                    <option value="shop">Shop</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="commercial">Commercial Property</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Listing type</label>

                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                  >
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₦)</label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 2500000"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Area / Size</label>

                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    min="0"
                  />
                </div>
              </div>
            </section>

            {/* LOCATION */}

            <section className="form-card">
              <div className="section-heading">
                <div className="section-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2>Location</h2>
                  <p>Help people find exactly where the property is located.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Address / Location</label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. 12 Aba Road, Umuahia"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Umuahia"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Abia"
                  />
                </div>
              </div>
            </section>

            {/* PROPERTY DETAILS */}

            <section className="form-card">
              <div className="section-heading">
                <div className="section-icon">
                  <BedDouble size={20} />
                </div>

                <div>
                  <h2>Property Details</h2>
                  <p>Add the important specifications of the property.</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-input">
                  <BedDouble size={19} />

                  <div>
                    <label>Bedrooms</label>

                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="detail-input">
                  <Bath size={19} />

                  <div>
                    <label>Bathrooms</label>

                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="detail-input">
                  <Car size={19} />

                  <div>
                    <label>Parking spaces</label>

                    <input
                      type="number"
                      name="parkingSpaces"
                      value={formData.parkingSpaces}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleChange}
                  />

                  <span>Price is negotiable</span>
                </label>
              </div>

              <div className="form-group">
                <label>Amenities</label>

                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="e.g. Security, Generator, Water, Parking"
                />

                <small>Separate multiple amenities with commas.</small>
              </div>
            </section>

            {/* LAND DETAILS */}

            {formData.type === "land" && (
              <section className="form-card">
                <div className="section-heading">
                  <div className="section-icon">
                    <LandPlot size={20} />
                  </div>

                  <div>
                    <h2>Land Information</h2>
                    <p>Provide additional information about the land.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Land unit</label>

                    <input
                      type="text"
                      name="landUnit"
                      value={formData.landUnit}
                      onChange={handleChange}
                      placeholder="e.g. Plot, Acre, Hectare"
                    />
                  </div>

                  <div className="form-group">
                    <label>Purpose</label>

                    <input
                      type="text"
                      name="landPurpose"
                      value={formData.landPurpose}
                      onChange={handleChange}
                      placeholder="e.g. Residential"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* IMAGES */}

            <section className="form-card">
              <div className="section-heading">
                <div className="section-icon">
                  <ImagePlus size={20} />
                </div>

                <div>
                  <h2>Property Images</h2>
                  <p>
                    Upload clear images to make your listing more attractive.
                  </p>
                </div>
              </div>

              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  hidden
                />

                <Upload size={28} />

                <strong>
                  {uploadingImages ? "Uploading..." : "Upload property images"}
                </strong>

                <span>JPG, PNG or WEBP images</span>
              </label>

              {images.length > 0 && (
                <div className="uploaded-list">
                  {images.map((image, index) => (
                    <div className="uploaded-image" key={`${image}-${index}`}>
                      <img
                        src={
                          image.startsWith("http")
                            ? image
                            : `${API_URL}${image}`
                        }
                        alt={`Property ${index + 1}`}
                      />

                      <button type="button" onClick={() => removeImage(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* DOCUMENTS */}

            <section className="form-card">
              <div className="section-heading">
                <div className="section-icon">
                  <FileText size={20} />
                </div>

                <div>
                  <h2>Documents</h2>
                  <p>Upload relevant property documents if available.</p>
                </div>
              </div>

              <label className="document-upload">
                <input
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  hidden
                />

                <FileText size={24} />

                <div>
                  <strong>Upload property documents</strong>

                  <span>Deeds, survey plans and other documents</span>
                </div>
              </label>

              {documents.length > 0 && (
                <div className="document-list">
                  {documents.map((document, index) => (
                    <div className="document-item" key={`${document}-${index}`}>
                      <FileText size={18} />

                      <span>Document {index + 1}</span>

                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* OWNER INFORMATION */}

            <section className="form-card">
              <div className="section-heading">
                <div className="section-icon">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h2>Contact Information</h2>
                  <p>Provide contact information for this property.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Owner name</label>

                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </div>

                <div className="form-group">
                  <label>Owner phone</label>

                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>

                <div className="form-group full">
                  <label>Owner email</label>

                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <aside className="property-form-sidebar">
            <div className="listing-summary">
              <span className="summary-label">YOUR LISTING</span>

              <h3>Ready to publish?</h3>

              <p>
                Review your information before publishing your property on
                RENTO.
              </p>

              <div className="summary-line">
                <span>Property type</span>
                <strong>{formData.type || "—"}</strong>
              </div>

              <div className="summary-line">
                <span>Listing</span>
                <strong>
                  {formData.listingType === "rent" ? "For Rent" : "For Sale"}
                </strong>
              </div>

              <div className="summary-line">
                <span>Images</span>
                <strong>{images.length}</strong>
              </div>

              <button
                type="submit"
                className="publish-button"
                disabled={loading || uploadingImages}
              >
                {loading ? "Publishing..." : "Publish Property"}

                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="secure-note">
                <CheckCircle2 size={17} />

                <span>
                  Your property will be reviewed and managed through your agent
                  dashboard.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default ListProperty;
