import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// --- ENUMS ---
export const targetTypeEnum = pgEnum("target_type", ["job", "prospect"]);
export const targetStatusEnum = pgEnum("target_status", [
  "pending_scrape", "scraped", "pending_score", "scored",
  "pending_generation", "generated", "pending_review",
  "approved", "rejected", "sending", "sent", "failed",
  "relance_scheduled", "relance_sent", "archived",
]);
export const deliverableTypeEnum = pgEnum("deliverable_type", [
  "cv_markdown", "cv_pdf_url", "cover_letter", "hook_message",
  "email_b2b_1", "email_b2b_relay", "audit_report", "value_proposition",
]);

// --- TABLES ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").unique().notNull(),
  fullName: text("full_name").notNull(),
  baseProfileText: text("base_profile_text").notNull(),
  profileSummary: text("profile_summary"),
  dailyQuotaJobs: integer("daily_quota_jobs").default(10).notNull(),
  dailyQuotaProspects: integer("daily_quota_prospects").default(10).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique().notNull(),
  jobSearchKeywords: text("job_search_keywords").array().default([]),
  jobSearchLocations: text("job_search_locations").array().default([]),
  jobSearchSources: text("job_search_sources").array().default(["linkedin", "indeed", "wttj"]),
  prospectIndustries: text("prospect_industries").array().default([]),
  prospectRoles: text("prospect_roles").array().default([]),
  prospectOfferType: text("prospect_offer_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const targets = pgTable("targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: targetTypeEnum("type").notNull(),
  status: targetStatusEnum("status").default("pending_scrape").notNull(),
  source: text("source"),
  externalUrl: text("external_url"),
  externalId: text("external_id"),
  rawData: jsonb("raw_data"),
  title: text("title"),
  companyName: text("company_name"),
  location: text("location"),
  description: text("description"),
  requirements: text("requirements").array().default([]),
  aiMatchScore: integer("ai_match_score"),
  aiMatchReasoning: text("ai_match_reasoning"),
  aiRelevanceTags: text("ai_relevance_tags").array().default([]),
  auditData: jsonb("audit_data"),
  batchDate: date("batch_date"),
  humanNotes: text("human_notes"),
  isHumanEdited: boolean("is_human_edited").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userStatusIdx: index("idx_targets_user_status").on(table.userId, table.status),
}));

export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetId: uuid("target_id").references(() => targets.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: deliverableTypeEnum("type").notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  isHumanEdited: boolean("is_human_edited").default(false),
  originalContent: text("original_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyQuotas = pgTable("daily_quotas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  type: targetTypeEnum("type").notNull(),
  scrapedCount: integer("scraped_count").default(0).notNull(),
  approvedCount: integer("approved_count").default(0).notNull(),
  sentCount: integer("sent_count").default(0).notNull(),
}, (table) => ({
  uniqueQuota: uniqueIndex("unique_quota").on(table.userId, table.date, table.type),
}));