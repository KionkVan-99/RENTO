import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

function AgentLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // ==================================================
      // SAVE LOGIN TOKEN
      // ==================================================

      localStorage.setItem("rentoToken", data.token);

      // ==================================================
      // SAVE AGENT INFORMATION
      // ==================================================

      const agent = {
        ...data.agent,
        plan: data.agent?.plan || "free",
      };

      localStorage.setItem("rentoAgent", JSON.stringify(agent));

      // ==================================================
      // REDIRECT
      // ==================================================

      if (agent.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/agent");
      }
    } catch (error) {
      setError(
        error.message || "Something went wrong. Please try again.",
      );
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

          <p>Agent management portal.</p>
        </div>

        <div className="agent-auth-card agent-login-card">
          <div className="agent-auth-heading">
            <div className="agent-auth-icon">
              <Building2 size={22} />
            </div>

            <div>
              <h1>Welcome Back</h1>

              <p>Sign in to manage your RENTO properties.</p>
            </div>
          </div>

          {error && <div className="agent-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="agent-auth-form">
            <div className="agent-auth-field">
              <label>Email Address</label>

              <div className="agent-auth-input">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="agent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="agent-auth-field">
              <label>Password</label>

              <div className="agent-auth-input">
                <Lock size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="agent-auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="agent-auth-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="agent-auth-footer">
            <span>Don't have an agent account?</span>

            <Link to="/agent/register">Create account</Link>
          </div>
        </div>

        <Link to="/" className="agent-auth-back">
          ← Back to RENTO
        </Link>
      </div>
    </div>
  );
}

export default AgentLogin;