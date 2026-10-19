import { eq, and } from "drizzle-orm";
import { db } from "../db/db.js";

import {
  agents,
  payments,
  subscriptions,
  properties,
  featuredListings,
} from "../db/schema.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const PLANS = {
  pro: {
    name: "Pro",
    price: 10000,
    durationDays: 30,
  },
  business: {
    name: "Business",
    price: 25000,
    durationDays: 30,
  },
};

const FEATURED_PACKAGES = {
  "7_days": {
    name: "Featured — 7 Days",
    price: 2000,
    durationDays: 7,
  },
  "14_days": {
    name: "Featured — 14 Days",
    price: 4000,
    durationDays: 14,
  },
  "30_days": {
    name: "Featured — 30 Days",
    price: 7500,
    durationDays: 30,
  },
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Initialize a transaction using Paystack.
// Amounts in the database are in naira; Paystack expects kobo.
const initializePaystack = async ({ email, amount, reference, purpose }) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    throw new Error(
      "Paystack test secret key is missing or is not a test key.",
    );
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(amount) * 100),
        currency: "NGN",
        reference,
        callback_url: `${FRONTEND_URL}/plans`,
        metadata: { purpose },
      }),
    },
  );

  const result = await response.json();

  if (!response.ok || !result.status || !result.data?.authorization_url) {
    console.error("Paystack initialization failed:", result.message);
    throw new Error("Paystack could not initialize this payment.");
  }

  return result.data;
};

// ======================================================
// CREATE SUBSCRIPTION PAYMENT
// ======================================================

export const createPayment = async (req, res) => {
  let paymentId;
  let subscriptionId;

  try {
    const agentId = Number(req.agent?.id);
    const { plan } = req.body;

    if (!Number.isInteger(agentId) || agentId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: "Invalid paid plan selected.",
      });
    }

    const [agent] = await db
      .select({
        id: agents.id,
        email: agents.email,
        plan: agents.plan,
      })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent account not found.",
      });
    }

    if (agent.plan === plan) {
      return res.status(400).json({
        success: false,
        message: `You are already on the ${selectedPlan.name} plan.`,
      });
    }

    const reference = `RENTO-SUB-${Date.now()}-${agentId}`;

    const [payment] = await db
      .insert(payments)
      .values({
        agentId,
        amount: String(selectedPlan.price),
        currency: "NGN",
        reference,
        provider: "paystack",
        purpose: "subscription",
        status: "pending",
      })
      .returning();

    paymentId = payment.id;

    // Save which plan was purchased against this payment.
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        agentId,
        plan,
        amount: String(selectedPlan.price),
        status: "pending",
        paymentId: payment.id,
      })
      .returning();

    subscriptionId = subscription.id;

    const checkout = await initializePaystack({
      email: agent.email,
      amount: selectedPlan.price,
      reference,
      purpose: "subscription",
    });

    return res.status(201).json({
      success: true,
      message: "Paystack checkout initialized.",
      authorizationUrl: checkout.authorization_url,
      reference: checkout.reference,
      payment: {
        id: payment.id,
        amount: selectedPlan.price,
        currency: "NGN",
        plan,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Create subscription payment error:", error.message);

    if (paymentId) {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, paymentId))
        .catch((dbError) =>
          console.error("Payment cleanup failed:", dbError.message),
        );
    }

    if (subscriptionId) {
      await db
        .update(subscriptions)
        .set({ status: "failed" })
        .where(eq(subscriptions.id, subscriptionId))
        .catch((dbError) =>
          console.error("Subscription cleanup failed:", dbError.message),
        );
    }

    return res.status(500).json({
      success: false,
      message: "Unable to start payment. Please try again.",
    });
  }
};

// ======================================================
// CREATE FEATURED LISTING PAYMENT
// ======================================================

export const createFeaturedPayment = async (req, res) => {
  let paymentId;
  let featuredListingId;

  try {
    const agentId = Number(req.agent?.id);
    const { propertyId, package: packageId } = req.body;

    if (!Number.isInteger(agentId) || agentId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const numericPropertyId = Number(propertyId);
    const selectedPackage = FEATURED_PACKAGES[packageId];

    if (!Number.isInteger(numericPropertyId) || numericPropertyId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid property ID is required.",
      });
    }

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: "Invalid featured listing package.",
      });
    }

    const [agent] = await db
      .select({
        id: agents.id,
        email: agents.email,
      })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent account not found.",
      });
    }

    const [property] = await db
      .select({
        id: properties.id,
        title: properties.title,
        agentId: properties.agentId,
        status: properties.status,
      })
      .from(properties)
      .where(eq(properties.id, numericPropertyId))
      .limit(1);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (Number(property.agentId) !== agentId) {
      return res.status(403).json({
        success: false,
        message: "You can only feature your own properties.",
      });
    }

    if (property.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active properties can be featured.",
      });
    }

    const existing = await db
      .select({
        id: featuredListings.id,
        status: featuredListings.status,
      })
      .from(featuredListings)
      .where(
        and(
          eq(featuredListings.propertyId, numericPropertyId),
          eq(featuredListings.agentId, agentId),
        ),
      );

    if (
      existing.some(
        (item) => item.status === "pending" || item.status === "active",
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This property already has a pending or active featured listing.",
      });
    }

    const reference = `RENTO-FEATURED-${Date.now()}-${agentId}`;

    const [payment] = await db
      .insert(payments)
      .values({
        agentId,
        propertyId: numericPropertyId,
        amount: String(selectedPackage.price),
        currency: "NGN",
        reference,
        provider: "paystack",
        purpose: "featured_listing",
        status: "pending",
      })
      .returning();

    paymentId = payment.id;

    const startDate = new Date();
    const endDate = addDays(startDate, selectedPackage.durationDays);

    // Your schema requires startDate and endDate even while pending.
    const [featuredListing] = await db
      .insert(featuredListings)
      .values({
        propertyId: numericPropertyId,
        agentId,
        paymentId: payment.id,
        startDate,
        endDate,
        status: "pending",
      })
      .returning();

    featuredListingId = featuredListing.id;

    const checkout = await initializePaystack({
      email: agent.email,
      amount: selectedPackage.price,
      reference,
      purpose: "featured_listing",
    });

    return res.status(201).json({
      success: true,
      message: "Paystack checkout initialized.",
      authorizationUrl: checkout.authorization_url,
      reference: checkout.reference,
      featuredListing: {
        id: featuredListing.id,
        propertyId: numericPropertyId,
        propertyTitle: property.title,
        package: packageId,
        packageName: selectedPackage.name,
        durationDays: selectedPackage.durationDays,
        amount: selectedPackage.price,
        currency: "NGN",
        status: "pending",
        paymentId: payment.id,
        reference,
      },
    });
  } catch (error) {
    console.error("Create featured payment error:", error.message);

    if (paymentId) {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, paymentId))
        .catch((dbError) =>
          console.error("Payment cleanup failed:", dbError.message),
        );
    }

    if (featuredListingId) {
      await db
        .update(featuredListings)
        .set({ status: "failed" })
        .where(eq(featuredListings.id, featuredListingId))
        .catch((dbError) =>
          console.error("Featured listing cleanup failed:", dbError.message),
        );
    }

    return res.status(500).json({
      success: false,
      message: "Unable to start featured listing payment. Please try again.",
    });
  }
};

// ======================================================
// VERIFY PAYMENT WITH PAYSTACK
// ======================================================

export const verifyPayment = async (req, res) => {
  try {
    const agentId = Number(req.agent?.id);
    const reference = String(req.body?.reference || "").trim();

    if (!Number.isInteger(agentId) || agentId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey || !secretKey.startsWith("sk_test_")) {
      return res.status(500).json({
        success: false,
        message: "Paystack test mode is not configured correctly.",
      });
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, reference))
      .limit(1);

    if (!payment || Number(payment.agentId) !== agentId) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this account.",
      });
    }

    // Idempotency: don't activate a payment twice.
    if (payment.status === "success") {
      let plan = null;

      if (payment.purpose === "subscription") {
        const [sub] = await db
          .select({ plan: subscriptions.plan })
          .from(subscriptions)
          .where(eq(subscriptions.paymentId, payment.id))
          .limit(1);

        plan = sub?.plan || null;
      }

      return res.json({
        success: true,
        message: "Payment has already been verified.",
        purpose: payment.purpose,
        plan,
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This payment is not pending.",
      });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();
    const transaction = result.data;

    if (!response.ok || !result.status || !transaction) {
      return res.status(502).json({
        success: false,
        message: "Paystack could not verify this transaction. Try again.",
      });
    }

    const expectedAmountKobo = Math.round(Number(payment.amount) * 100);

    if (
      transaction.status !== "success" ||
      transaction.reference !== payment.reference ||
      transaction.currency !== payment.currency ||
      Number(transaction.amount) !== expectedAmountKobo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not successful or its amount does not match the RENTO record.",
      });
    }

    const now = new Date();

    if (payment.purpose === "subscription") {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.paymentId, payment.id))
        .limit(1);

      if (!subscription) {
        return res.status(400).json({
          success: false,
          message: "Subscription record was not found.",
        });
      }

      const planConfig = PLANS[subscription.plan];

      if (
        !planConfig ||
        Number(subscription.amount) !== Number(payment.amount)
      ) {
        return res.status(400).json({
          success: false,
          message: "Subscription details do not match the payment.",
        });
      }

      const endDate = addDays(now, planConfig.durationDays);

      await db
        .update(payments)
        .set({ status: "success", provider: "paystack" })
        .where(eq(payments.id, payment.id));

      await db
        .update(subscriptions)
        .set({
          status: "active",
          startDate: now,
          endDate,
        })
        .where(eq(subscriptions.id, subscription.id));

      await db
        .update(agents)
        .set({ plan: subscription.plan })
        .where(eq(agents.id, agentId));

      return res.json({
        success: true,
        message: "Subscription payment verified and plan activated.",
        purpose: "subscription",
        plan: subscription.plan,
        endDate,
      });
    }

    if (payment.purpose === "featured_listing") {
      const [featuredListing] = await db
        .select()
        .from(featuredListings)
        .where(eq(featuredListings.paymentId, payment.id))
        .limit(1);

      if (!featuredListing) {
        return res.status(400).json({
          success: false,
          message: "Featured listing record was not found.",
        });
      }

      const packageEntry = Object.entries(FEATURED_PACKAGES).find(
        ([, item]) => item.price === Number(payment.amount),
      );

      if (!packageEntry) {
        return res.status(400).json({
          success: false,
          message: "Featured package does not match the payment amount.",
        });
      }

      const [, selectedPackage] = packageEntry;
      const endDate = addDays(now, selectedPackage.durationDays);

      await db
        .update(payments)
        .set({ status: "success", provider: "paystack" })
        .where(eq(payments.id, payment.id));

      await db
        .update(featuredListings)
        .set({
          status: "active",
          startDate: now,
          endDate,
        })
        .where(eq(featuredListings.id, featuredListing.id));

      await db
        .update(properties)
        .set({ featured: true })
        .where(eq(properties.id, featuredListing.propertyId));

      return res.json({
        success: true,
        message: "Featured listing payment verified and promotion activated.",
        purpose: "featured_listing",
        endDate,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported payment purpose.",
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment right now. Please try again.",
    });
  }
};

// ======================================================
// GET MY PAYMENTS
// ======================================================

export const getMyPayments = async (req, res) => {
  try {
    const agentId = Number(req.agent?.id);

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.agentId, agentId));

    return res.json({ success: true, payments: result });
  } catch (error) {
    console.error("Get payments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments.",
    });
  }
};

// ======================================================
// GET MY SUBSCRIPTIONS
// ======================================================

export const getMySubscriptions = async (req, res) => {
  try {
    const agentId = Number(req.agent?.id);

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.agentId, agentId));

    return res.json({ success: true, subscriptions: result });
  } catch (error) {
    console.error("Get subscriptions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions.",
    });
  }
};

// ======================================================
// GET MY FEATURED LISTINGS
// ======================================================

export const getMyFeaturedListings = async (req, res) => {
  try {
    const agentId = Number(req.agent?.id);

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await db
      .select()
      .from(featuredListings)
      .where(eq(featuredListings.agentId, agentId));

    return res.json({ success: true, featuredListings: result });
  } catch (error) {
    console.error("Get featured listings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured listings.",
    });
  }
};
