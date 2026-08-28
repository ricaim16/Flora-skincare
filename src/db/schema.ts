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

export const accountRoleEnum = pgEnum("account_role", [
  "customer",
  "admin",
]);

export const bookingSourceEnum = pgEnum("booking_source", [
  "website",
  "admin",
]);

export const expenseEntryTypeEnum = pgEnum("expense_entry_type", [
  "expense",
  "tip",
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
    description: text("description")
      .notNull()
      .default("Personalized skincare treatment."),
    imageUrl: text("image_url"),

    durationMinutes: integer("duration_minutes")
      .notNull()
      .default(90),

    priceInCents: integer("price_in_cents").notNull(),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    isMembersOnly: boolean("is_members_only")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugUniqueIdx: uniqueIndex("services_slug_unique_idx").on(t.slug),
    activeIdx: index("services_active_idx").on(t.isActive),
    membersOnlyIdx: index("services_members_only_idx").on(t.isMembersOnly),
  })
);

/* ──────────────────────────────────────────────
   CUSTOMERS
────────────────────────────────────────────── */

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),

    name: text("name").notNull(),
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
   BOOKINGS
────────────────────────────────────────────── */

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),

    // Client info
    name: text("name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    customerId: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),

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
    bookingSource: bookingSourceEnum("booking_source")
      .notNull()
      .default("website"),

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
    uniqueSlotIdx: uniqueIndex("bookings_unique_slot_idx").on(
      t.appointmentDate,
      t.appointmentTime
    ),

    serviceIdx: index("bookings_service_idx").on(t.serviceId),
    statusIdx: index("bookings_status_idx").on(t.status),
    customerIdx: index("bookings_customer_idx").on(t.customerId),
  })
);

/* ──────────────────────────────────────────────
   ADMINS
────────────────────────────────────────────── */

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),

    name: text("name").notNull().default("Manager"),
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
   PASSWORD RESET OTPS
────────────────────────────────────────────── */

export const passwordResetOtps = pgTable(
  "password_reset_otps",
  {
    id: serial("id").primaryKey(),

    email: text("email").notNull(),
    accountType: accountRoleEnum("account_type").notNull(),
    codeHash: text("code_hash").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    accountIdx: index("password_reset_otps_account_idx").on(
      t.email,
      t.accountType
    ),
    expiryIdx: index("password_reset_otps_expiry_idx").on(t.expiresAt),
  })
);

/* ──────────────────────────────────────────────
   EXPENSES / TIPS
────────────────────────────────────────────── */

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    note: text("note"),
    entryType: expenseEntryTypeEnum("entry_type").notNull(),
    amountInCents: integer("amount_in_cents").notNull(),
    entryDate: date("entry_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    dateIdx: index("expenses_entry_date_idx").on(t.entryDate),
    typeIdx: index("expenses_entry_type_idx").on(t.entryType),
  })
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

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
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
export const contactsRelations = relations(contacts, () => ({
  // For example, assignedAdmin: one(admins, { fields: [contacts.assignedAdminId], references: [admins.id] })
}));
