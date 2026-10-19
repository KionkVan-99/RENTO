import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Crown,
  Building2,
  Sparkles,
  ShieldCheck,
  Lock,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://rento-api-rime.onrender.come.onrender.come.onrender.com";

function Plans() {
  const navigate = useNavigate();

  const [loadingPlan, setLoadingPlan] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const readAgent = () => {
    try {
      const stored = localStorage.getItem("rentoAgent");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [agent, setAgent] = useState(readAgent);
  const currentPlan = agent?.plan || "free";

  // Verify the payment after Paystack redirects back to /plans.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) return;

    let cancelled = false;

    const verifyPayment = async () => {
      const token = localStorage.getItem("rentoToken");

      if (!token) {
        setMessage("Please log in again to verify your payment.");
        setMessageType("error");
        return;
      }

      try {
        setLoadingPlan("verify");
        setMessage("Verifying your payment with Paystack...");
        setMessageType("success");

        const response = await fetch(`${API_URL}/api/payments/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Payment verification failed.");
        }

        if (cancelled) return;

        if (data.purpose === "subscription" && data.plan) {
          const updatedAgent = {
            ...(readAgent() || {}),
            plan: data.plan,
          };

          localStorage.setItem("rentoAgent", JSON.stringify(updatedAgent));
          setAgent(updatedAgent);

          setMessage(
            `Payment successful! Your ${data.plan} plan is now active.`,
          );
        } else {
          setMessage(
            "Payment successful! Your featured listing has been activated.",
          );
        }

        setMessageType("success");

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } catch (error) {
        if (cancelled) return;

        setMessage(error.message || "Could not verify payment.");
        setMessageType("error");
      } finally {
        if (!cancelled) setLoadingPlan("");
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  const plans = [
    {
      id: "free",
      name: "Free",
      icon: <Sparkles size={24} />,
      price: "₦0",
      period: "forever",
      description:
        "Start listing your properties and discover what RENTO can do for you.",
      features: [
        "5 active properties",
        "Property management dashboard",
        "Receive property inquiries",
        "Public agent profile",
        "Basic property listings",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      icon: <Crown size={24} />,
      price: "₦10,000",
      period: "per month",
      description:
        "For agents who manage more properties and want additional visibility.",
      features: [
        "30 active properties",
        "Featured listing capability",
        "Better property visibility",
        "Advanced agent tools",
        "Priority opportunities",
      ],
    },
    {
      id: "business",
      name: "Business",
      icon: <Building2 size={24} />,
      price: "₦25,000",
      period: "per month",
      description:
        "Built for agencies and professionals managing a larger property portfolio.",
      features: [
        "100 active properties",
        "Agency-focused tools",
        "Large property portfolio",
        "Premium management features",
        "Enhanced visibility",
      ],
    },
  ];

  const handlePlanAction = async (plan) => {
    setMessage("");
    setMessageType("");

    if (!agent) {
      navigate("/agent/login");
      return;
    }

    if (plan.id === currentPlan || plan.id === "free") return;

    const token = localStorage.getItem("rentoToken");

    if (!token) {
      setMessage("Your login session has expired. Please log in again.");
      setMessageType("error");
      return;
    }

    try {
      setLoadingPlan(plan.id);

      const response = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: plan.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to start payment.");
      }

      if (!data.authorizationUrl) {
        throw new Error("Paystack did not return a checkout URL.");
      }

      window.location.assign(data.authorizationUrl);
    } catch (error) {
      setMessage(error.message || "Unable to start payment.");
      setMessageType("error");
      setLoadingPlan("");
    }
  };

  return (
    <div className="plans-page">
      <div className="plans-header">
        <Link to="/agent" className="plans-back">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="plans-heading">
          <span className="plans-eyebrow">RENTO MEMBERSHIP</span>
          <h1>
            Choose the plan that
            <span> fits your business.</span>
          </h1>
          <p>
            Start for free and upgrade when you need more property listings and
            additional tools.
          </p>
        </div>

        {agent && (
          <div className="current-plan-box">
            <div className="current-plan-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span>Your current plan</span>
              <strong>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`plans-message ${
            messageType === "success" ? "success-message" : "error-message"
          }`}
          role="status"
        >
          {messageType === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              className={`plan-card ${
                plan.id === "pro" ? "featured-plan" : ""
              } ${isCurrent ? "current-plan" : ""}`}
              key={plan.id}
            >
              {plan.id === "pro" && (
                <div className="popular-badge">POPULAR</div>
              )}

              {isCurrent && (
                <div className="active-plan-badge">CURRENT PLAN</div>
              )}

              <div className="plan-icon">{plan.icon}</div>
              <h2>{plan.name}</h2>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <div className="plan-divider" />

              <div className="plan-features">
                {plan.features.map((feature) => (
                  <div className="plan-feature" key={feature}>
                    <Check size={17} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={`plan-button ${isCurrent ? "current-button" : ""}`}
                disabled={isCurrent || plan.id === "free" || loadingPlan !== ""}
                onClick={() => handlePlanAction(plan)}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={17} className="spinning" />
                    {loadingPlan === "verify"
                      ? "Verifying payment..."
                      : "Opening Paystack..."}
                  </>
                ) : isCurrent ? (
                  <>
                    <ShieldCheck size={17} />
                    Current Plan
                  </>
                ) : plan.id === "free" ? (
                  <>Free Plan</>
                ) : (
                  <>
                    <Lock size={16} />
                    Upgrade to {plan.name}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="plans-security">
        <ShieldCheck size={21} />
        <div>
          <strong>Secure payment activation</strong>
          <p>
            Your plan changes only after the backend verifies your payment
            directly with Paystack.
          </p>
        </div>
      </div>

      <div className="plans-bottom">
        <p>Need help choosing a plan?</p>
        <Link to="/agent">Return to Dashboard</Link>
      </div>
    </div>
  );
}

export default Plans;
