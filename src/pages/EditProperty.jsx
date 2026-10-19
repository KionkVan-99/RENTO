import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  ImagePlus,
  LandPlot,
  Mail,
  MapPin,
  ParkingSquare,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../index.css";

const API_BASE_URL = "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/properties`;
const UPLOAD_URL = `${API_BASE_URL}/api/upload`;

const propertyTypes = [
  {
    id: "house",
    title: "House",
    description: "Standalone houses, duplexes and family homes.",
    icon: Building2,
  },
  {
    id: "apartment",
    title: "Apartment",
    description: "Flats, studios and apartment units.",
    icon: Building2,
  },
  {
    id: "land",
    title: "Land",
    description: "Residential, commercial and agricultural land.",
    icon: LandPlot,
  },
  {
    id: "commercial",
    title: "Commercial",
    description: "Shops, offices, warehouses and business spaces.",
    icon: Building2,
  },
];

const steps = [
  "Property type",
  "Basic details",
  "Location & price",
  "Features",
  "Photos",
  "Review",
];

const amenities = [
  "Parking",
  "Security",
  "Water supply",
  "Electricity",
  "Generator",
  "Swimming pool",
  "Furnished",
  "Serviced",
];

const landDocuments = [
  "C of O",
  "Deed of Assignment",
  "Survey Plan",
  "Governor's Consent",
  "Registered Deed",
  "Other",
];

const initialForm = {
  propertyType: "",
  listingTitle: "",
  description: "",
  purpose: "Sale",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  landSize: "",
  landUnit: "Plots",
  landPurpose: "Residential",
  documents: [],
  address: "",
  city: "",
  state: "",
  price: "",
  negotiable: false,
  amenities: [],
  images: [],
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
};

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleArrayValue = (field, value) => {
    setForm((previous) => {
      const exists = previous[field].includes(value);

      return {
        ...previous,
        [field]: exists
          ? previous[field].filter((item) => item !== value)
          : [...previous[field], value],
      };
    });
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

  const handleImages = (files) => {
    const selectedFiles = Array.from(files || []);

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    setForm((previous) => ({
      ...previous,
      images: [...previous.images, ...imageFiles].slice(0, 12),
    }));
  };

  const removeImage = (index) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setSubmitError("");

        const token = localStorage.getItem("rentoToken");

        if (!token) {
          navigate("/agent/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load property.");
        }

        const property = data.property;

        if (!property) {
          throw new Error("Property could not be found.");
        }

        const propertyType = String(property.type || "").toLowerCase();

        let mappedType = "house";

        if (propertyType === "apartment") {
          mappedType = "apartment";
        } else if (propertyType === "land") {
          mappedType = "land";
        } else if (propertyType === "commercial") {
          mappedType = "commercial";
        }

        const purpose = property.listingType === "rent" ? "Rent" : "Sale";

        const existingImages = Array.isArray(property.images)
          ? property.images
          : [];

        setForm({
          propertyType: mappedType,
          listingTitle: property.title || "",
          description: property.description || "",
          purpose,
          bedrooms: property.bedrooms ?? "",
          bathrooms: property.bathrooms ?? "",
          parkingSpaces: property.parkingSpaces ?? "",
          landSize: property.area ?? "",
          landUnit: property.landUnit || "Plots",
          landPurpose: property.landPurpose || "Residential",
          documents: Array.isArray(property.documents)
            ? property.documents
            : [],
          address: property.location || "",
          city: property.city || "",
          state: property.state || "",
          price: property.price ?? "",
          negotiable: Boolean(property.negotiable),
          amenities: Array.isArray(property.amenities)
            ? property.amenities
            : [],
          images: existingImages,
          ownerName: property.ownerName || "",
          ownerPhone: property.ownerPhone || "",
          ownerEmail: property.ownerEmail || "",
        });
      } catch (error) {
        console.error("Edit property loading error:", error);

        setSubmitError(error.message || "Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((step) => step + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const uploadNewImages = async (imageFiles) => {
    if (!imageFiles.length) {
      return [];
    }

    const formData = new FormData();

    imageFiles.forEach((image) => {
      formData.append("images", image);
    });

    setUploadProgress(20);

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    setUploadProgress(70);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Image upload failed.");
    }

    if (!Array.isArray(data.images)) {
      throw new Error("The server did not return uploaded images.");
    }

    const uploadedImages = data.images.map((item) => {
      const imagePath = item.image;

      return imagePath.startsWith("http")
        ? imagePath
        : `${API_BASE_URL}${imagePath}`;
    });

    setUploadProgress(85);

    return uploadedImages;
  };

  const validateForm = () => {
    if (!form.propertyType) {
      throw new Error("Please select a property type.");
    }

    if (!form.listingTitle.trim()) {
      throw new Error("Please enter a listing title.");
    }

    if (!form.description.trim()) {
      throw new Error("Please provide a property description.");
    }

    if (!form.price || Number(form.price) <= 0) {
      throw new Error("Please enter a valid property price.");
    }

    if (!form.city.trim()) {
      throw new Error("Please enter the property city.");
    }

    if (!form.state.trim()) {
      throw new Error("Please enter the property state.");
    }

    if (!form.ownerName.trim()) {
      throw new Error("Please enter the property owner's name.");
    }

    if (!form.ownerPhone.trim()) {
      throw new Error("Please enter the property owner's phone number.");
    }

    if (!form.images.length) {
      throw new Error("Please keep at least one property image.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setSubmitError("");
    setUploadProgress(0);

    try {
      validateForm();

      const token = localStorage.getItem("rentoToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const propertyType =
        form.propertyType === "house"
          ? "House"
          : form.propertyType === "apartment"
            ? "Apartment"
            : form.propertyType === "land"
              ? "Land"
              : "Commercial";

      const listingType = form.purpose === "Rent" ? "rent" : "buy";

      const existingImages = form.images.filter(
        (image) => typeof image === "string",
      );

      const newImages = form.images.filter(
        (image) => typeof image !== "string",
      );

      let uploadedNewImages = [];

      if (newImages.length > 0) {
        uploadedNewImages = await uploadNewImages(newImages);
      }

      const finalImages = [...existingImages, ...uploadedNewImages].slice(
        0,
        12,
      );

      if (!finalImages.length) {
        throw new Error("At least one property image is required.");
      }

      const propertyData = {
        title: form.listingTitle.trim(),
        description: form.description.trim(),
        type: propertyType,
        listingType,
        price: Number(form.price),
        location: form.address.trim() || form.city.trim() || "Nigeria",
        city: form.city.trim(),
        state: form.state.trim(),

        bedrooms: form.propertyType === "land" ? 0 : Number(form.bedrooms) || 0,

        bathrooms:
          form.propertyType === "land" ? 0 : Number(form.bathrooms) || 0,

        parkingSpaces:
          form.propertyType === "land" ? 0 : Number(form.parkingSpaces) || 0,

        area: form.propertyType === "land" ? Number(form.landSize) || 0 : 0,

        landUnit: form.propertyType === "land" ? form.landUnit : null,

        landPurpose: form.propertyType === "land" ? form.landPurpose : null,

        negotiable: Boolean(form.negotiable),

        amenities: form.propertyType === "land" ? [] : form.amenities,

        documents: form.propertyType === "land" ? form.documents : [],

        images: finalImages,

        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim(),
        ownerEmail: form.ownerEmail.trim() || null,

        featured: false,
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update property.");
      }

      setUploadProgress(100);

      alert("✅ Property updated successfully!");

      navigate(`/property/${id}`);
    } catch (error) {
      console.error("Property update error:", error);

      setSubmitError(
        error.message || "Something went wrong while updating the property.",
      );

      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  const isLand = form.propertyType === "land";

  if (loading) {
    return (
      <div className="edit-property-loading-page">
        <div className="edit-property-loading">
          <LoaderCircle size={42} className="edit-spin" />

          <h2>Loading property...</h2>

          <p>Preparing your listing for editing.</p>
        </div>

        <style>{`
          .edit-property-loading-page {
            min-height:100vh;
            background:#070707;
            color:#fff;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:30px;
          }

          .edit-property-loading {
            width:min(500px,100%);
            text-align:center;
            padding:50px 35px;
            border:1px solid rgba(216,181,106,.18);
            border-radius:24px;
            background:linear-gradient(145deg,#111,#090909);
            box-shadow:0 25px 80px rgba(0,0,0,.45);
          }

          .edit-property-loading svg {
            color:#d8b56a;
            margin-bottom:18px;
          }

          .edit-property-loading h2 {
            margin:0 0 8px;
            font-size:28px;
          }

          .edit-property-loading p {
            margin:0;
            color:#888;
          }

          .edit-spin {
            animation:editSpin 1s linear infinite;
          }

          @keyframes editSpin {
            to { transform:rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (submitError && !form.listingTitle) {
    return (
      <div className="edit-property-loading-page">
        <div className="edit-property-loading error">
          <X size={42} />

          <h2>Unable to load property</h2>

          <p>{submitError}</p>

          <button
            type="button"
            className="edit-back-main"
            onClick={() => navigate("/agent")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        <style>{`
          .edit-property-loading.error svg {
            color:#ff7777;
          }

          .edit-back-main {
            margin-top:25px;
            border:1px solid rgba(216,181,106,.3);
            background:#d8b56a;
            color:#090909;
            padding:13px 20px;
            border-radius:12px;
            font-weight:800;
            display:inline-flex;
            align-items:center;
            gap:8px;
            cursor:pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="list-property-page edit-property-page">
      <style>{`
        .edit-property-page {
          --edit-gold:#d8b56a;
          --edit-gold-bright:#f1d18a;
          --edit-bg:#070707;
          --edit-card:#101010;
          --edit-card-2:#141414;
          --edit-border:rgba(255,255,255,.09);
          --edit-muted:#858585;
          --edit-white:#f5f5f5;
          min-height:100vh;
          background:
            radial-gradient(circle at 85% 10%,rgba(216,181,106,.09),transparent 28%),
            radial-gradient(circle at 5% 55%,rgba(216,181,106,.045),transparent 25%),
            #070707;
          color:var(--edit-white);
        }

        .edit-property-page * {
          box-sizing:border-box;
        }

        .edit-property-page .listing-header {
          position:sticky;
          top:0;
          z-index:50;
          background:rgba(7,7,7,.88);
          backdrop-filter:blur(22px);
          border-bottom:1px solid rgba(255,255,255,.07);
        }

        .edit-property-page .listing-header-inner {
          width:min(1450px,calc(100% - 50px));
          min-height:82px;
          margin:auto;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:25px;
        }

        .edit-property-page .listing-logo {
          color:#fff;
          text-decoration:none;
          font-size:26px;
          font-weight:900;
          letter-spacing:-1.5px;
        }

        .edit-property-page .listing-logo span {
          color:var(--edit-gold);
        }

        .edit-property-page .listing-header-title {
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:3px;
        }

        .edit-property-page .listing-header-title span {
          color:var(--edit-gold);
          font-size:10px;
          letter-spacing:2.4px;
          font-weight:800;
        }

        .edit-property-page .listing-header-title strong {
          font-size:15px;
        }

        .edit-property-page .listing-exit {
          color:#aaa;
          text-decoration:none;
          display:flex;
          align-items:center;
          gap:7px;
          font-weight:700;
          transition:.25s;
        }

        .edit-property-page .listing-exit:hover {
          color:#fff;
        }

        .edit-property-page .listing-progress {
          border-bottom:1px solid rgba(255,255,255,.07);
          background:#0b0b0b;
        }

        .edit-property-page .listing-progress-inner {
          width:min(1100px,calc(100% - 40px));
          margin:auto;
          min-height:76px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          overflow-x:auto;
        }

        .edit-property-page .progress-step {
          display:flex;
          align-items:center;
          gap:9px;
          white-space:nowrap;
          color:#5d5d5d;
          font-size:11px;
          font-weight:800;
          letter-spacing:.3px;
        }

        .edit-property-page .progress-number {
          width:29px;
          height:29px;
          border-radius:50%;
          border:1px solid #303030;
          display:grid;
          place-items:center;
          font-size:11px;
        }

        .edit-property-page .progress-step.active {
          color:#fff;
        }

        .edit-property-page .progress-step.active .progress-number,
        .edit-property-page .progress-step.completed .progress-number {
          background:var(--edit-gold);
          border-color:var(--edit-gold);
          color:#080808;
        }

        .edit-property-page .progress-step.completed {
          color:#aaa;
        }

        .edit-property-page .progress-line {
          width:55px;
          height:1px;
          background:#242424;
          flex:none;
        }

        .edit-property-page .progress-line.completed {
          background:rgba(216,181,106,.55);
        }

        .edit-property-page .listing-main {
          padding:55px 0 90px;
        }

        .edit-property-page .listing-shell {
          width:min(1380px,calc(100% - 50px));
          margin:auto;
          display:grid;
          grid-template-columns:330px minmax(0,1fr);
          gap:45px;
          align-items:start;
        }

        .edit-property-page .listing-sidebar {
          position:sticky;
          top:140px;
        }

        .edit-property-page .sidebar-intro {
          padding:10px 5px 35px;
        }

        .edit-property-page .eyebrow {
          color:var(--edit-gold);
          font-size:10px;
          font-weight:900;
          letter-spacing:2px;
        }

        .edit-property-page .sidebar-intro h1 {
          margin:14px 0 15px;
          font-size:37px;
          line-height:1.06;
          letter-spacing:-1.6px;
        }

        .edit-property-page .sidebar-intro p {
          color:#858585;
          line-height:1.75;
          font-size:14px;
          margin:0;
        }

        .edit-property-page .listing-trust {
          display:flex;
          gap:13px;
          padding:18px;
          border-radius:16px;
          border:1px solid rgba(216,181,106,.17);
          background:rgba(216,181,106,.045);
        }

        .edit-property-page .listing-trust > svg {
          color:var(--edit-gold);
          flex:none;
        }

        .edit-property-page .listing-trust strong,
        .edit-property-page .listing-trust span {
          display:block;
        }

        .edit-property-page .listing-trust strong {
          font-size:13px;
          margin-bottom:5px;
        }

        .edit-property-page .listing-trust span {
          color:#777;
          line-height:1.5;
          font-size:11px;
        }

        .edit-property-page .listing-content {
          min-width:0;
        }

        .edit-property-page .listing-content form {
          width:100%;
        }

        .edit-property-page .listing-step {
          background:linear-gradient(145deg,#111,#0c0c0c);
          border:1px solid rgba(255,255,255,.075);
          border-radius:25px;
          padding:40px;
          box-shadow:0 25px 70px rgba(0,0,0,.25);
        }

        .edit-property-page .step-heading {
          margin-bottom:32px;
        }

        .edit-property-page .step-heading h2 {
          margin:10px 0 8px;
          font-size:28px;
          letter-spacing:-.8px;
        }

        .edit-property-page .step-heading p {
          margin:0;
          color:#777;
          font-size:13px;
        }

        .edit-property-page .property-type-selection {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:13px;
        }

        .edit-property-page .property-type-option {
          position:relative;
          min-height:130px;
          border:1px solid rgba(255,255,255,.08);
          border-radius:17px;
          padding:22px;
          text-align:left;
          background:#0d0d0d;
          color:#fff;
          cursor:pointer;
          display:flex;
          gap:15px;
          align-items:flex-start;
          transition:.25s ease;
        }

        .edit-property-page .property-type-option:hover {
          transform:translateY(-3px);
          border-color:rgba(216,181,106,.35);
        }

        .edit-property-page .property-type-option.selected {
          background:rgba(216,181,106,.07);
          border-color:var(--edit-gold);
          box-shadow:0 0 0 1px rgba(216,181,106,.08),
                     0 15px 35px rgba(216,181,106,.06);
        }

        .edit-property-page .type-icon {
          width:46px;
          height:46px;
          flex:none;
          border-radius:13px;
          display:grid;
          place-items:center;
          background:#181818;
          color:#aaa;
        }

        .edit-property-page .selected .type-icon {
          background:var(--edit-gold);
          color:#080808;
        }

        .edit-property-page .type-copy strong,
        .edit-property-page .type-copy span {
          display:block;
        }

        .edit-property-page .type-copy strong {
          margin-bottom:6px;
          font-size:15px;
        }

        .edit-property-page .type-copy span {
          color:#777;
          font-size:11px;
          line-height:1.55;
        }

        .edit-property-page .selection-check {
          position:absolute;
          right:14px;
          top:14px;
          width:23px;
          height:23px;
          border:1px solid #333;
          border-radius:50%;
          display:grid;
          place-items:center;
        }

        .edit-property-page .selected .selection-check {
          background:var(--edit-gold);
          color:#080808;
          border-color:var(--edit-gold);
        }

        .edit-property-page .purpose-box {
          margin-top:20px;
          padding:20px;
          border-radius:17px;
          border:1px solid rgba(255,255,255,.07);
          background:#0c0c0c;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
        }

        .edit-property-page .purpose-box strong,
        .edit-property-page .purpose-box span {
          display:block;
        }

        .edit-property-page .purpose-box strong {
          font-size:13px;
          margin-bottom:5px;
        }

        .edit-property-page .purpose-box span {
          color:#666;
          font-size:11px;
        }

        .edit-property-page .segmented-control {
          padding:4px;
          border-radius:11px;
          background:#171717;
          display:flex;
          gap:3px;
          flex:none;
        }

        .edit-property-page .segmented-control button {
          border:0;
          border-radius:8px;
          background:transparent;
          color:#777;
          padding:10px 17px;
          font-size:11px;
          font-weight:800;
          cursor:pointer;
        }

        .edit-property-page .segmented-control button.active {
          background:var(--edit-gold);
          color:#080808;
        }

        .edit-property-page .form-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
        }

        .edit-property-page .form-field {
          min-width:0;
        }

        .edit-property-page .form-field.full {
          grid-column:1/-1;
        }

        .edit-property-page .form-field label {
          display:block;
          margin-bottom:8px;
          color:#b5b5b5;
          font-size:11px;
          font-weight:800;
        }

        .edit-property-page .field-note {
          color:#555;
          font-weight:500;
        }

        .edit-property-page input,
        .edit-property-page textarea,
        .edit-property-page select {
          width:100%;
          border:1px solid rgba(255,255,255,.09);
          outline:none;
          border-radius:12px;
          background:#0b0b0b;
          color:#fff;
          padding:14px 15px;
          font:inherit;
          font-size:13px;
          transition:.2s;
        }

        .edit-property-page textarea {
          resize:vertical;
          min-height:150px;
          line-height:1.65;
        }

        .edit-property-page input:focus,
        .edit-property-page textarea:focus,
        .edit-property-page select:focus {
          border-color:rgba(216,181,106,.65);
          box-shadow:0 0 0 3px rgba(216,181,106,.06);
        }

        .edit-property-page input::placeholder,
        .edit-property-page textarea::placeholder {
          color:#454545;
        }

        .edit-property-page .input-with-icon {
          position:relative;
        }

        .edit-property-page .input-with-icon > svg {
          position:absolute;
          left:14px;
          top:50%;
          transform:translateY(-50%);
          color:#555;
          pointer-events:none;
        }

        .edit-property-page .input-with-icon input {
          padding-left:43px;
        }

        .edit-property-page .select-wrapper {
          position:relative;
        }

        .edit-property-page .select-wrapper svg {
          position:absolute;
          right:13px;
          top:50%;
          transform:translateY(-50%);
          color:#777;
          pointer-events:none;
        }

        .edit-property-page select {
          appearance:none;
        }

        .edit-property-page .location-highlight {
          display:flex;
          align-items:center;
          gap:13px;
          padding:17px;
          margin-bottom:25px;
          border:1px solid rgba(216,181,106,.14);
          border-radius:15px;
          background:rgba(216,181,106,.045);
        }

        .edit-property-page .location-highlight > svg {
          color:var(--edit-gold);
        }

        .edit-property-page .location-highlight strong,
        .edit-property-page .location-highlight span {
          display:block;
        }

        .edit-property-page .location-highlight strong {
          font-size:13px;
          margin-bottom:4px;
        }

        .edit-property-page .location-highlight span {
          font-size:11px;
          color:#777;
        }

        .edit-property-page .price-input {
          position:relative;
        }

        .edit-property-page .price-input > span {
          position:absolute;
          left:15px;
          top:50%;
          transform:translateY(-50%);
          color:var(--edit-gold);
          font-weight:900;
        }

        .edit-property-page .price-input input {
          padding-left:35px;
        }

        .edit-property-page .checkbox-row {
          display:flex;
          align-items:center;
          gap:10px;
          cursor:pointer;
          color:#aaa;
          font-size:12px;
        }

        .edit-property-page .checkbox-row input {
          display:none;
        }

        .edit-property-page .custom-checkbox {
          width:20px;
          height:20px;
          border:1px solid #3b3b3b;
          border-radius:6px;
          display:grid;
          place-items:center;
          color:#080808;
          background:#101010;
        }

        .edit-property-page .checkbox-row input:checked + .custom-checkbox {
          background:var(--edit-gold);
          border-color:var(--edit-gold);
        }

        .edit-property-page .detail-section {
          padding:23px;
          border:1px solid rgba(255,255,255,.07);
          border-radius:17px;
          background:#0d0d0d;
        }

        .edit-property-page .detail-section + .detail-section {
          margin-top:18px;
        }

        .edit-property-page .detail-section-heading {
          display:flex;
          align-items:center;
          gap:12px;
          margin-bottom:20px;
        }

        .edit-property-page .detail-section-heading > svg {
          color:var(--edit-gold);
        }

        .edit-property-page .detail-section-heading strong,
        .edit-property-page .detail-section-heading span {
          display:block;
        }

        .edit-property-page .detail-section-heading strong {
          font-size:13px;
          margin-bottom:4px;
        }

        .edit-property-page .detail-section-heading span {
          font-size:11px;
          color:#666;
        }

        .edit-property-page .choice-grid,
        .edit-property-page .amenities-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:9px;
        }

        .edit-property-page .choice-button,
        .edit-property-page .amenity-button {
          min-height:46px;
          border:1px solid rgba(255,255,255,.07);
          border-radius:10px;
          background:#111;
          color:#888;
          cursor:pointer;
          padding:10px 13px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          font-size:11px;
          font-weight:700;
          transition:.2s;
        }

        .edit-property-page .choice-button:hover,
        .edit-property-page .amenity-button:hover {
          border-color:rgba(216,181,106,.35);
          color:#ddd;
        }

        .edit-property-page .choice-button.selected,
        .edit-property-page .amenity-button.selected {
          background:rgba(216,181,106,.09);
          color:var(--edit-gold-bright);
          border-color:rgba(216,181,106,.45);
        }

        .edit-property-page .amenity-button > span {
          width:21px;
          height:21px;
          border-radius:6px;
          border:1px solid #333;
          display:grid;
          place-items:center;
          flex:none;
        }

        .edit-property-page .amenity-button.selected > span {
          background:var(--edit-gold);
          color:#080808;
          border-color:var(--edit-gold);
        }

        .edit-property-page .upload-zone {
          min-height:230px;
          border:1px dashed rgba(216,181,106,.35);
          border-radius:18px;
          background:rgba(216,181,106,.025);
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          cursor:pointer;
          transition:.25s;
          padding:30px;
        }

        .edit-property-page .upload-zone:hover,
        .edit-property-page .upload-zone.drag-active {
          background:rgba(216,181,106,.07);
          border-color:var(--edit-gold);
        }

        .edit-property-page .upload-zone input,
        .edit-property-page .add-more-image input {
          display:none;
        }

        .edit-property-page .upload-icon {
          width:55px;
          height:55px;
          border-radius:16px;
          display:grid;
          place-items:center;
          background:rgba(216,181,106,.12);
          color:var(--edit-gold);
          margin-bottom:15px;
        }

        .edit-property-page .upload-zone strong {
          font-size:15px;
          margin-bottom:7px;
        }

        .edit-property-page .upload-zone span {
          color:#777;
          font-size:12px;
        }

        .edit-property-page .upload-zone small {
          color:#4e4e4e;
          font-size:10px;
          margin-top:9px;
        }

        .edit-property-page .image-preview-grid {
          margin-top:20px;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:11px;
        }

        .edit-property-page .image-preview {
          position:relative;
          height:155px;
          border-radius:13px;
          overflow:hidden;
          background:#080808;
          border:1px solid rgba(255,255,255,.08);
        }

        .edit-property-page .image-preview img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        .edit-property-page .image-preview > button {
          position:absolute;
          right:8px;
          top:8px;
          width:30px;
          height:30px;
          border:1px solid rgba(255,255,255,.15);
          border-radius:8px;
          background:rgba(0,0,0,.75);
          color:#fff;
          display:grid;
          place-items:center;
          cursor:pointer;
        }

        .edit-property-page .image-preview > button:hover {
          background:#d85f5f;
        }

        .edit-property-page .cover-label {
          position:absolute;
          top:8px;
          left:8px;
          padding:5px 8px;
          border-radius:6px;
          background:var(--edit-gold);
          color:#080808;
          font-size:8px;
          font-weight:900;
          text-transform:uppercase;
        }

        .edit-property-page .add-more-image {
          min-height:155px;
          border:1px dashed #333;
          border-radius:13px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          gap:7px;
          color:#666;
          cursor:pointer;
        }

        .edit-property-page .add-more-image:hover {
          border-color:var(--edit-gold);
          color:var(--edit-gold);
        }

        .edit-property-page .review-card {
          border:1px solid rgba(216,181,106,.2);
          background:
            linear-gradient(145deg,rgba(216,181,106,.08),rgba(255,255,255,.015));
          border-radius:18px;
          padding:25px;
        }

        .edit-property-page .review-top {
          display:flex;
          justify-content:space-between;
          gap:20px;
        }

        .edit-property-page .review-label {
          color:var(--edit-gold);
          font-size:9px;
          text-transform:uppercase;
          font-weight:900;
          letter-spacing:1.5px;
        }

        .edit-property-page .review-top h3 {
          margin:8px 0 7px;
          font-size:20px;
        }

        .edit-property-page .review-top p {
          margin:0;
          color:#777;
          font-size:12px;
        }

        .edit-property-page .review-price {
          text-align:right;
        }

        .edit-property-page .review-price span,
        .edit-property-page .review-price strong {
          display:block;
        }

        .edit-property-page .review-price span {
          color:#666;
          font-size:10px;
        }

        .edit-property-page .review-price strong {
          color:var(--edit-gold-bright);
          margin-top:5px;
          font-size:20px;
        }

        .edit-property-page .review-divider {
          height:1px;
          background:rgba(255,255,255,.08);
          margin:22px 0;
        }

        .edit-property-page .review-details {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:15px;
        }

        .edit-property-page .review-details span,
        .edit-property-page .review-details strong {
          display:block;
        }

        .edit-property-page .review-details span {
          color:#5e5e5e;
          font-size:10px;
          margin-bottom:5px;
        }

        .edit-property-page .review-details strong {
          font-size:13px;
        }

        .edit-property-page .review-note {
          margin-top:18px;
          display:flex;
          gap:12px;
          padding:16px;
          border:1px solid rgba(216,181,106,.15);
          background:rgba(216,181,106,.04);
          border-radius:13px;
        }

        .edit-property-page .review-note > svg {
          color:var(--edit-gold);
          flex:none;
        }

        .edit-property-page .review-note strong {
          font-size:12px;
        }

        .edit-property-page .review-note p {
          color:#777;
          margin:5px 0 0;
          font-size:11px;
        }

        .edit-property-page .listing-actions {
          margin-top:20px;
          display:flex;
          justify-content:space-between;
          gap:12px;
        }

        .edit-property-page .back-button,
        .edit-property-page .next-button,
        .edit-property-page .publish-button {
          min-height:50px;
          border-radius:12px;
          padding:0 20px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:9px;
          font-size:12px;
          font-weight:900;
          cursor:pointer;
          text-decoration:none;
          transition:.25s;
        }

        .edit-property-page .back-button {
          background:#101010;
          border:1px solid rgba(255,255,255,.09);
          color:#aaa;
        }

        .edit-property-page .back-button:hover {
          color:#fff;
          border-color:#333;
        }

        .edit-property-page .next-button,
        .edit-property-page .publish-button {
          background:var(--edit-gold);
          color:#080808;
          border:1px solid var(--edit-gold);
        }

        .edit-property-page .next-button:hover,
        .edit-property-page .publish-button:hover {
          background:var(--edit-gold-bright);
          transform:translateY(-2px);
          box-shadow:0 12px 30px rgba(216,181,106,.13);
        }

        .edit-property-page button:disabled {
          opacity:.5;
          cursor:not-allowed;
          transform:none !important;
        }

        @media(max-width:1050px) {
          .edit-property-page .listing-shell {
            grid-template-columns:1fr;
          }

          .edit-property-page .listing-sidebar {
            position:static;
          }

          .edit-property-page .sidebar-intro {
            padding-bottom:20px;
          }

          .edit-property-page .sidebar-intro h1 {
            font-size:31px;
          }
        }

        @media(max-width:760px) {
          .edit-property-page .listing-header-inner {
            width:calc(100% - 30px);
            min-height:70px;
          }

          .edit-property-page .listing-header-title {
            display:none;
          }

          .edit-property-page .listing-progress-inner {
            justify-content:flex-start;
          }

          .edit-property-page .progress-line {
            width:25px;
          }

          .edit-property-page .listing-main {
            padding-top:30px;
          }

          .edit-property-page .listing-shell {
            width:calc(100% - 30px);
          }

          .edit-property-page .listing-step {
            padding:25px 18px;
            border-radius:18px;
          }

          .edit-property-page .property-type-selection,
          .edit-property-page .form-grid {
            grid-template-columns:1fr;
          }

          .edit-property-page .form-field.full {
            grid-column:auto;
          }

          .edit-property-page .purpose-box {
            flex-direction:column;
            align-items:stretch;
          }

          .edit-property-page .segmented-control {
            width:100%;
          }

          .edit-property-page .segmented-control button {
            width:50%;
          }

          .edit-property-page .image-preview-grid {
            grid-template-columns:repeat(2,1fr);
          }

          .edit-property-page .review-details {
            grid-template-columns:repeat(2,1fr);
          }
        }

        @media(max-width:480px) {
          .edit-property-page .listing-shell {
            width:calc(100% - 20px);
          }

          .edit-property-page .listing-step {
            padding:20px 14px;
          }

          .edit-property-page .property-type-option {
            padding:17px;
          }

          .edit-property-page .choice-grid,
          .edit-property-page .amenities-grid {
            grid-template-columns:1fr;
          }

          .edit-property-page .review-top {
            flex-direction:column;
          }

          .edit-property-page .review-price {
            text-align:left;
          }

          .edit-property-page .listing-actions {
            flex-direction:column-reverse;
          }

          .edit-property-page .back-button,
          .edit-property-page .next-button,
          .edit-property-page .publish-button {
            width:100%;
          }
        }
      `}</style>

      <header className="listing-header">
        <div className="listing-header-inner">
          <Link to="/agent" className="listing-logo">
            RENTO<span>.</span>
          </Link>

          <div className="listing-header-title">
            <span>EDIT PROPERTY</span>
            <strong>Update your listing</strong>
          </div>

          <Link to="/agent" className="listing-exit">
            Exit
            <X size={17} />
          </Link>
        </div>
      </header>

      <div className="listing-progress">
        <div className="listing-progress-inner">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const completed = stepNumber < currentStep;
            const active = stepNumber === currentStep;

            return (
              <React.Fragment key={step}>
                <div
                  className={`progress-step ${
                    active ? "active" : ""
                  } ${completed ? "completed" : ""}`}
                >
                  <div className="progress-number">
                    {completed ? <Check size={15} /> : stepNumber}
                  </div>

                  <span>{step}</span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`progress-line ${completed ? "completed" : ""}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <main className="listing-main">
        <div className="listing-shell">
          <aside className="listing-sidebar">
            <div className="sidebar-intro">
              <span className="eyebrow">EDIT · STEP {currentStep} OF 6</span>

              <h1>
                {currentStep === 1 && "Update your property type."}

                {currentStep === 2 && "Update the details."}

                {currentStep === 3 && "Update the location."}

                {currentStep === 4 && "Update the features."}

                {currentStep === 5 && "Manage your photos."}

                {currentStep === 6 && "Review your changes."}
              </h1>

              <p>
                Update your listing information and keep your property details
                accurate on RENTO.
              </p>
            </div>

            <div className="listing-trust">
              <ShieldCheck size={20} />

              <div>
                <strong>Your listing stays protected.</strong>

                <span>
                  Only the agent who owns this property can update it.
                </span>
              </div>
            </div>
          </aside>

          <section className="listing-content">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="listing-step">
                  <div className="step-heading">
                    <span className="eyebrow">01 / PROPERTY TYPE</span>

                    <h2>Choose the type of property.</h2>

                    <p>Update the property classification if needed.</p>
                  </div>

                  <div className="property-type-selection">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      const selected = form.propertyType === type.id;

                      return (
                        <button
                          type="button"
                          key={type.id}
                          className={`property-type-option ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() => updateForm("propertyType", type.id)}
                        >
                          <div className="type-icon">
                            <Icon size={24} />
                          </div>

                          <div className="type-copy">
                            <strong>{type.title}</strong>
                            <span>{type.description}</span>
                          </div>

                          <div className="selection-check">
                            {selected && <Check size={15} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="purpose-box">
                    <div>
                      <strong>What are you offering?</strong>

                      <span>
                        Choose whether this property is for sale or rent.
                      </span>
                    </div>

                    <div className="segmented-control">
                      <button
                        type="button"
                        className={form.purpose === "Sale" ? "active" : ""}
                        onClick={() => updateForm("purpose", "Sale")}
                      >
                        For Sale
                      </button>

                      <button
                        type="button"
                        className={form.purpose === "Rent" ? "active" : ""}
                        onClick={() => updateForm("purpose", "Rent")}
                      >
                        For Rent
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="listing-step">
                  <div className="step-heading">
                    <span className="eyebrow">02 / BASIC DETAILS</span>

                    <h2>Describe your property.</h2>

                    <p>Update the title, description and property details.</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full">
                      <label>Listing title</label>

                      <input
                        type="text"
                        placeholder={
                          isLand
                            ? "e.g. 5 Plots Residential Land in Aba"
                            : "e.g. Luxury 4 Bedroom Duplex in GRA"
                        }
                        value={form.listingTitle}
                        onChange={(event) =>
                          updateForm("listingTitle", event.target.value)
                        }
                      />
                    </div>

                    <div className="form-field full">
                      <label>Description</label>

                      <textarea
                        rows="7"
                        placeholder="Tell people about the property..."
                        value={form.description}
                        onChange={(event) =>
                          updateForm("description", event.target.value)
                        }
                      />
                    </div>

                    {!isLand && (
                      <>
                        <div className="form-field">
                          <label>Bedrooms</label>

                          <div className="input-with-icon">
                            <BedDouble size={18} />

                            <input
                              type="number"
                              min="0"
                              value={form.bedrooms}
                              onChange={(event) =>
                                updateForm("bedrooms", event.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label>Bathrooms</label>

                          <div className="input-with-icon">
                            <Bath size={18} />

                            <input
                              type="number"
                              min="0"
                              value={form.bathrooms}
                              onChange={(event) =>
                                updateForm("bathrooms", event.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label>Parking spaces</label>

                          <div className="input-with-icon">
                            <ParkingSquare size={18} />

                            <input
                              type="number"
                              min="0"
                              value={form.parkingSpaces}
                              onChange={(event) =>
                                updateForm("parkingSpaces", event.target.value)
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {isLand && (
                      <>
                        <div className="form-field">
                          <label>Land size</label>

                          <input
                            type="number"
                            min="0"
                            value={form.landSize}
                            onChange={(event) =>
                              updateForm("landSize", event.target.value)
                            }
                          />
                        </div>

                        <div className="form-field">
                          <label>Unit</label>

                          <div className="select-wrapper">
                            <select
                              value={form.landUnit}
                              onChange={(event) =>
                                updateForm("landUnit", event.target.value)
                              }
                            >
                              <option>Plots</option>
                              <option>Acres</option>
                              <option>Hectares</option>
                              <option>Square meters</option>
                            </select>

                            <ChevronDown size={17} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="listing-step">
                  <div className="step-heading">
                    <span className="eyebrow">03 / LOCATION & PRICE</span>

                    <h2>Where can people find it?</h2>

                    <p>Update the location and pricing information.</p>
                  </div>

                  <div className="location-highlight">
                    <MapPin size={21} />

                    <div>
                      <strong>Property location</strong>

                      <span>Keep the location information accurate.</span>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full">
                      <label>Street address / area</label>

                      <input
                        type="text"
                        value={form.address}
                        onChange={(event) =>
                          updateForm("address", event.target.value)
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>City</label>

                      <input
                        type="text"
                        value={form.city}
                        onChange={(event) =>
                          updateForm("city", event.target.value)
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>State</label>

                      <input
                        type="text"
                        value={form.state}
                        onChange={(event) =>
                          updateForm("state", event.target.value)
                        }
                      />
                    </div>

                    <div className="form-field full">
                      <label>
                        Price <span className="field-note">(₦)</span>
                      </label>

                      <div className="price-input">
                        <span>₦</span>

                        <input
                          type="number"
                          min="0"
                          value={form.price}
                          onChange={(event) =>
                            updateForm("price", event.target.value)
                          }
                        />
                      </div>
                    </div>

                    <label className="checkbox-row full">
                      <input
                        type="checkbox"
                        checked={form.negotiable}
                        onChange={(event) =>
                          updateForm("negotiable", event.target.checked)
                        }
                      />

                      <span className="custom-checkbox">
                        {form.negotiable && <Check size={13} />}
                      </span>

                      <span>Price is negotiable</span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="listing-step">
                  <div className="step-heading">
                    <span className="eyebrow">04 / FEATURES</span>

                    <h2>What makes this property special?</h2>

                    <p>Update the features and documentation.</p>
                  </div>

                  {isLand ? (
                    <>
                      <div className="detail-section">
                        <div className="detail-section-heading">
                          <LandPlot size={20} />

                          <div>
                            <strong>Land purpose</strong>

                            <span>What can the land be used for?</span>
                          </div>
                        </div>

                        <div className="choice-grid">
                          {[
                            "Residential",
                            "Commercial",
                            "Agricultural",
                            "Mixed Use",
                          ].map((purpose) => (
                            <button
                              type="button"
                              key={purpose}
                              className={`choice-button ${
                                form.landPurpose === purpose ? "selected" : ""
                              }`}
                              onClick={() => updateForm("landPurpose", purpose)}
                            >
                              {purpose}

                              {form.landPurpose === purpose && (
                                <Check size={16} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="detail-section">
                        <div className="detail-section-heading">
                          <ShieldCheck size={20} />

                          <div>
                            <strong>Available documentation</strong>

                            <span>
                              Select the documents available for the land.
                            </span>
                          </div>
                        </div>

                        <div className="amenities-grid">
                          {landDocuments.map((document) => (
                            <button
                              type="button"
                              key={document}
                              className={`amenity-button ${
                                form.documents.includes(document)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleArrayValue("documents", document)
                              }
                            >
                              <span>
                                {form.documents.includes(document) && (
                                  <Check size={14} />
                                )}
                              </span>

                              {document}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="detail-section">
                      <div className="detail-section-heading">
                        <Plus size={20} />

                        <div>
                          <strong>Property amenities</strong>

                          <span>Choose everything that genuinely applies.</span>
                        </div>
                      </div>

                      <div className="amenities-grid">
                        {amenities.map((amenity) => (
                          <button
                            type="button"
                            key={amenity}
                            className={`amenity-button ${
                              form.amenities.includes(amenity) ? "selected" : ""
                            }`}
                            onClick={() =>
                              toggleArrayValue("amenities", amenity)
                            }
                          >
                            <span>
                              {form.amenities.includes(amenity) && (
                                <Check size={14} />
                              )}
                            </span>

                            {amenity}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div className="listing-step">
                  <div className="step-heading">
                    <span className="eyebrow">05 / PHOTOS</span>

                    <h2>Manage your property photos.</h2>

                    <p>Keep the best images and add new ones when necessary.</p>
                  </div>

                  <label
                    className={`upload-zone ${dragActive ? "drag-active" : ""}`}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragActive(false);

                      handleImages(event.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(event) => handleImages(event.target.files)}
                    />

                    <div className="upload-icon">
                      <Upload size={25} />
                    </div>

                    <strong>Add more photos</strong>

                    <span>Drop photos here or click to browse</span>

                    <small>JPG, PNG, WEBP or GIF · Up to 12 photos total</small>
                  </label>

                  {form.images.length > 0 && (
                    <div className="image-preview-grid">
                      {form.images.map((image, index) => {
                        const isExisting = typeof image === "string";

                        const previewUrl = isExisting
                          ? getImageUrl(image)
                          : URL.createObjectURL(image);

                        return (
                          <div
                            className="image-preview"
                            key={
                              isExisting
                                ? `${image}-${index}`
                                : `${image.name}-${image.lastModified}-${index}`
                            }
                          >
                            <img
                              src={previewUrl}
                              alt={`Property ${index + 1}`}
                              onError={(event) => {
                                event.currentTarget.src =
                                  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80";
                              }}
                            />

                            {index === 0 && (
                              <span className="cover-label">Cover</span>
                            )}

                            {isExisting && (
                              <span
                                className="cover-label"
                                style={{
                                  top: "auto",
                                  bottom: "8px",
                                  left: "8px",
                                }}
                              >
                                Saved
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              aria-label="Remove image"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}

                      {form.images.length < 12 && (
                        <label className="add-more-image">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            onChange={(event) =>
                              handleImages(event.target.files)
                            }
                          />

                          <ImagePlus size={22} />

                          <span>Add more</span>
                        </label>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "14px 16px",
                      border: "1px solid rgba(216,181,106,.18)",
                      background: "rgba(216,181,106,.05)",
                      borderRadius: "12px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      {form.images.length}/12 photos
                    </strong>

                    <span
                      style={{
                        fontSize: "13px",
                        opacity: 0.65,
                      }}
                    >
                      The first photo will be used as the cover image.
                    </span>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="listing-step">
                  <div className="step-heading">
                    <span className="eyebrow">06 / REVIEW</span>

                    <h2>Review your changes.</h2>

                    <p>Make sure everything looks correct before saving.</p>
                  </div>

                  <div className="detail-section">
                    <div className="detail-section-heading">
                      <UserRound size={20} />

                      <div>
                        <strong>Contact information</strong>

                        <span>
                          Update the contact information shown with your
                          listing.
                        </span>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field full">
                        <label>Owner / Contact name</label>

                        <div className="input-with-icon">
                          <UserRound size={18} />

                          <input
                            type="text"
                            value={form.ownerName}
                            onChange={(event) =>
                              updateForm("ownerName", event.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Phone number</label>

                        <div className="input-with-icon">
                          <Phone size={18} />

                          <input
                            type="tel"
                            value={form.ownerPhone}
                            onChange={(event) =>
                              updateForm("ownerPhone", event.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>
                          Email <span className="field-note">(optional)</span>
                        </label>

                        <div className="input-with-icon">
                          <Mail size={18} />

                          <input
                            type="email"
                            value={form.ownerEmail}
                            onChange={(event) =>
                              updateForm("ownerEmail", event.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="review-card">
                    <div className="review-top">
                      <div>
                        <span className="review-label">
                          {form.propertyType}
                        </span>

                        <h3>{form.listingTitle || "Untitled property"}</h3>

                        <p>
                          {form.city || "City"}, {form.state || "State"}
                        </p>
                      </div>

                      <div className="review-price">
                        <span>Price</span>

                        <strong>
                          ₦{Number(form.price || 0).toLocaleString("en-NG")}
                        </strong>
                      </div>
                    </div>

                    <div className="review-divider" />

                    <div className="review-details">
                      {isLand ? (
                        <>
                          <div>
                            <span>Land size</span>

                            <strong>
                              {form.landSize || "—"} {form.landUnit}
                            </strong>
                          </div>

                          <div>
                            <span>Purpose</span>

                            <strong>{form.landPurpose}</strong>
                          </div>

                          <div>
                            <span>Documents</span>

                            <strong>{form.documents.length} selected</strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span>Bedrooms</span>

                            <strong>{form.bedrooms || "—"}</strong>
                          </div>

                          <div>
                            <span>Bathrooms</span>

                            <strong>{form.bathrooms || "—"}</strong>
                          </div>

                          <div>
                            <span>Parking</span>

                            <strong>{form.parkingSpaces || "—"}</strong>
                          </div>
                        </>
                      )}

                      <div>
                        <span>Photos</span>

                        <strong>{form.images.length}</strong>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "16px 18px",
                        border: "1px solid rgba(255,80,80,.35)",
                        background: "rgba(255,60,60,.08)",
                        borderRadius: "12px",
                        color: "#ff8a8a",
                      }}
                    >
                      <strong>Update failed</strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                        }}
                      >
                        {submitError}
                      </p>
                    </div>
                  )}

                  {saving && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "18px",
                        border: "1px solid rgba(216,181,106,.2)",
                        background: "rgba(216,181,106,.05)",
                        borderRadius: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <strong>
                          {uploadProgress < 85
                            ? "Uploading new photos..."
                            : "Saving property changes..."}
                        </strong>

                        <span>{uploadProgress}%</span>
                      </div>

                      <div
                        style={{
                          height: "6px",
                          borderRadius: "99px",
                          background: "rgba(255,255,255,.08)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${uploadProgress}%`,
                            height: "100%",
                            background: "#d8b56a",
                            transition: "width .3s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="review-note">
                    <ShieldCheck size={19} />

                    <div>
                      <strong>Your changes are protected</strong>

                      <p>
                        Only your authenticated agent account can update this
                        property.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="listing-actions">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="back-button"
                    onClick={previousStep}
                    disabled={saving}
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                ) : (
                  <Link to="/agent" className="back-button">
                    <ArrowLeft size={18} />
                    Cancel
                  </Link>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    className="next-button"
                    onClick={nextStep}
                    disabled={saving}
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="publish-button"
                    disabled={saving}
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}

                    {saving ? (
                      <LoaderCircle size={18} className="edit-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EditProperty;
