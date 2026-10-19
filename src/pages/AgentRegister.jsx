import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";

const API_URL = "https://rento-api-rime.onrender.com/api/auth";

function AgentRegister() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    agencyName: "",
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // PROFILE PHOTO
  // ======================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5MB.");
      return;
    }

    setProfileImage(file);

    const imageUrl = URL.createObjectURL(file);

    setPreviewUrl(imageUrl);
  };

  const removeImage = () => {
    setProfileImage(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ==================================================
      // FORM DATA
      // ==================================================

      const formData = new FormData();

      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("agencyName", form.agencyName);
      formData.append("password", form.password);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      // ==================================================
      // REGISTER
      // ==================================================

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // ==================================================
      // SAVE AUTHENTICATION
      // ==================================================

      localStorage.setItem("rentoToken", data.token);

      // Make sure older backend responses cannot leave
      // the frontend without a plan.
      const agent = {
        ...data.agent,
        plan: data.agent?.plan || "free",
      };

      localStorage.setItem("rentoAgent", JSON.stringify(agent));

      // ==================================================
      // GO TO DASHBOARD
      // ==================================================

      navigate("/agent");
    } catch (error) {
      console.error("Registration error:", error);

      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-auth-page">
      <div className="agent-auth-background">
        <div className="agent-auth-glow agent-auth-glow-one"></div>
        <div className="agent-auth-glow agent-auth-glow-two"></div>
      </div>

      <div className="agent-auth-container">
        <div className="agent-auth-brand">
          <Link to="/" className="agent-auth-logo">
            REN<span>TO</span>
          </Link>

          <p>Property marketplace for modern living.</p>
        </div>

        <div className="agent-auth-card">
          <div className="agent-auth-heading">
            <div className="agent-auth-icon">
              <Building2 size={22} />
            </div>

            <div>
              <h1>Create Agent Account</h1>

              <p>Join RENTO and start managing your property listings.</p>
            </div>
          </div>

          {error && <div className="agent-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="agent-auth-form">
            {/* ==========================================
                PROFILE PHOTO
            ========================================== */}

            <div className="agent-profile-upload">
              <label className="agent-profile-label">Profile Photo</label>

              <div
                className={`agent-profile-photo ${
                  previewUrl ? "has-image" : ""
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Profile preview" />

                    <button
                      type="button"
                      className="agent-profile-remove"
                      onClick={removeImage}
                      aria-label="Remove profile photo"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="agent-profile-placeholder">
                    <Camera size={28} />

                    <span>Add photo</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="user"
                onChange={handleImageChange}
                className="agent-profile-file-input"
              />

              <button
                type="button"
                className="agent-profile-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={17} />

                {previewUrl ? "Change Photo" : "Take / Choose Photo"}
              </button>

              <small>JPG, PNG or WEBP · Maximum 5MB</small>
            </div>

            {/* ==========================================
                FULL NAME
            ========================================== */}

            <div className="agent-auth-field">
              <label>Full Name *</label>

              <div className="agent-auth-input">
                <User size={18} />

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ==========================================
                EMAIL
            ========================================== */}

            <div className="agent-auth-field">
              <label>Email Address *</label>

              <div className="agent-auth-input">
                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  placeholder="agent@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ==========================================
                PHONE + AGENCY
            ========================================== */}

            <div className="agent-auth-row">
              <div className="agent-auth-field">
                <label>Phone</label>

                <div className="agent-auth-input">
                  <Phone size={18} />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="080..."
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="agent-auth-field">
                <label>Agency Name</label>

                <div className="agent-auth-input">
                  <Building2 size={18} />

                  <input
                    type="text"
                    name="agencyName"
                    placeholder="Your agency"
                    value={form.agencyName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ==========================================
                PASSWORD
            ========================================== */}

            <div className="agent-auth-field">
              <label>Password *</label>

              <div className="agent-auth-input">
                <Lock size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="agent-auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ==========================================
                CONFIRM PASSWORD
            ========================================== */}

            <div className="agent-auth-field">
              <label>Confirm Password *</label>

              <div className="agent-auth-input">
                <Lock size={18} />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="agent-auth-eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* ==========================================
                SUBMIT
            ========================================== */}

            <button
              type="submit"
              className="agent-auth-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Agent Account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="agent-auth-footer">
            <span>Already have an account?</span>

            <Link to="/agent/login">Sign in</Link>
          </div>
        </div>

        <Link to="/" className="agent-auth-back">
          ← Back to RENTO
        </Link>
      </div>
    </div>
  );
}

export default AgentRegister;
