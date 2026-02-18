// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  date,
  time,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

/* ──────────────────────────────────────────────
   ENUMS
────────────────────────────────────────────── */

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const reportTypeEnum = pgEnum("report_type", [
  "weekly",
  "monthly",
  "yearly",
]);

/* ──────────────────────────────────────────────
   SERVICES
────────────────────────────────────────────── */

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    durationMinutes: integer("duration_minutes")
      .notNull()
      .default(90),

    priceInCents: integer("price_in_cents").notNull(),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugUniqueIdx: uniqueIndex("services_slug_unique_idx").on(t.slug),
    activeIdx: index("services_active_idx").on(t.isActive),
  })
);

/* ──────────────────────────────────────────────
   BOOKINGS
────────────────────────────────────────────── */

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),

    // Client info
    name: text("name").notNull(),
    phoneNumber: text("phone_number").notNull(),

    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),

    appointmentDate: date("appointment_date").notNull(),
    appointmentTime: time("appointment_time").notNull(),

    // Workflow
    status: appointmentStatusEnum("status")
      .notNull()
      .default("pending"),

    notes: text("notes"),

    emailSent: boolean("email_sent")
      .notNull()
      .default(false),

    adminNotified: boolean("admin_notified")
      .notNull()
      .default(false),

    // Financial snapshot
    priceAtBooking: integer("price_at_booking").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueClientSlotIdx: uniqueIndex("bookings_unique_client_slot_idx").on(
      t.phoneNumber,
      t.appointmentDate,
      t.appointmentTime
    ),

    serviceIdx: index("bookings_service_idx").on(t.serviceId),
    statusIdx: index("bookings_status_idx").on(t.status),
  })
);

/* ──────────────────────────────────────────────
   ADMINS
────────────────────────────────────────────── */

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),

    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

/* ──────────────────────────────────────────────
   REPORTS (CACHED)
────────────────────────────────────────────── */

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),

    reportType: reportTypeEnum("report_type").notNull(),

    totalClients: integer("total_clients").notNull(),
    totalRevenueInCents: integer("total_revenue_in_cents").notNull(),

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    periodIdx: index("reports_period_idx").on(
      t.reportType,
      t.startDate,
      t.endDate
    ),
  })
);

/* ──────────────────────────────────────────────
   RELATIONS
────────────────────────────────────────────── */

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));





/* ──────────────────────────────────────────────
   CONTACTS
────────────────────────────────────────────── */

export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),

    name: text("name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number"),
    message: text("message").notNull(),

    isRead: boolean("is_read").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: index("contacts_email_idx").on(t.email),
    readIdx: index("contacts_read_idx").on(t.isRead),
  })
);

/* ──────────────────────────────────────────────
   RELATIONS (if needed)
────────────────────────────────────────────── */

// Optional: If you later want to relate contacts to admins who reply
export const contactsRelations = relations(contacts, ({ one }) => ({
  // For example, assignedAdmin: one(admins, { fields: [contacts.assignedAdminId], references: [admins.id] })
}));
