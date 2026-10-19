import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

// ======================================================
// AGENTS
// ======================================================

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),

  fullName: varchar("full_name", {
    length: 150,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),

  phone: varchar("phone", {
    length: 30,
  }),

  password: varchar("password", {
    length: 255,
  }).notNull(),

  agencyName: varchar("agency_name", {
    length: 200,
  }),

  profileImage: text("profile_image"),

  plan: varchar("plan", {
    length: 30,
  })
    .default("free")
    .notNull(),

  role: varchar("role", {
    length: 30,
  })
    .default("agent")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================
// PROPERTIES
// ======================================================

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  description: text("description"),

  type: varchar("type", {
    length: 50,
  }).notNull(),

  listingType: varchar("listing_type", {
    length: 30,
  }).notNull(),

  price: numeric("price", {
    precision: 15,
    scale: 2,
  }).notNull(),

  location: varchar("location", {
    length: 255,
  }).notNull(),

  city: varchar("city", {
    length: 100,
  }),

  state: varchar("state", {
    length: 100,
  }),

  bedrooms: integer("bedrooms"),

  bathrooms: integer("bathrooms"),

  parkingSpaces: integer("parking_spaces"),

  area: numeric("area", {
    precision: 15,
    scale: 2,
  }),

  landUnit: varchar("land_unit", {
    length: 50,
  }),

  landPurpose: varchar("land_purpose", {
    length: 100,
  }),

  negotiable: boolean("negotiable").default(false).notNull(),

  featured: boolean("featured").default(false).notNull(),

  amenities: text("amenities"),

  documents: text("documents"),

  images: text("images"),

  ownerName: varchar("owner_name", {
    length: 150,
  }),

  ownerPhone: varchar("owner_phone", {
    length: 30,
  }),

  ownerEmail: varchar("owner_email", {
    length: 255,
  }),

  status: varchar("status", {
    length: 30,
  })
    .default("active")
    .notNull(),

  soldAt: timestamp("sold_at"),

  rentedAt: timestamp("rented_at"),

  tenantName: varchar("tenant_name", {
    length: 150,
  }),

  tenantPhone: varchar("tenant_phone", {
    length: 30,
  }),

  tenantEmail: varchar("tenant_email", {
    length: 255,
  }),

  monthlyRent: numeric("monthly_rent", {
    precision: 15,
    scale: 2,
  }),

  moveInDate: timestamp("move_in_date"),

  leaseDuration: varchar("lease_duration", {
    length: 100,
  }),

  agentId: integer("agent_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================
// MESSAGES
// ======================================================

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),

  propertyId: integer("property_id").notNull(),

  senderName: varchar("sender_name", {
    length: 150,
  }).notNull(),

  senderEmail: varchar("sender_email", {
    length: 255,
  }),

  senderPhone: varchar("sender_phone", {
    length: 30,
  }),

  message: text("message").notNull(),

  isRead: boolean("is_read").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================
// INSPECTION REQUESTS
// ======================================================

export const inspectionRequests = pgTable("inspection_requests", {
  id: serial("id").primaryKey(),

  propertyId: integer("property_id").notNull(),

  visitorName: varchar("visitor_name", {
    length: 150,
  }).notNull(),

  visitorEmail: varchar("visitor_email", {
    length: 255,
  }),

  visitorPhone: varchar("visitor_phone", {
    length: 30,
  }),

  preferredDate: varchar("preferred_date", {
    length: 50,
  }),

  preferredTime: varchar("preferred_time", {
    length: 50,
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================
// PAYMENTS
// ======================================================

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),

  agentId: integer("agent_id").notNull(),

  propertyId: integer("property_id"),

  amount: numeric("amount", {
    precision: 15,
    scale: 2,
  }).notNull(),

  currency: varchar("currency", {
    length: 10,
  })
    .default("NGN")
    .notNull(),

  reference: varchar("reference", {
    length: 255,
  })
    .notNull()
    .unique(),

  provider: varchar("provider", {
    length: 50,
  }).notNull(),

  purpose: varchar("purpose", {
    length: 50,
  }).notNull(),

  status: varchar("status", {
    length: 30,
  })
    .default("pending")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================
// SUBSCRIPTIONS
// ======================================================

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),

  agentId: integer("agent_id").notNull(),

  plan: varchar("plan", {
    length: 30,
  }).notNull(),

  amount: numeric("amount", {
    precision: 15,
    scale: 2,
  }).notNull(),

  status: varchar("status", {
    length: 30,
  })
    .default("pending")
    .notNull(),

  startDate: timestamp("start_date"),

  endDate: timestamp("end_date"),

  paymentId: integer("payment_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================
// FEATURED LISTINGS
// ======================================================

export const featuredListings = pgTable("featured_listings", {
  id: serial("id").primaryKey(),

  propertyId: integer("property_id").notNull(),

  agentId: integer("agent_id").notNull(),

  paymentId: integer("payment_id"),

  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date").notNull(),

  status: varchar("status", {
    length: 30,
  })
    .default("pending")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
