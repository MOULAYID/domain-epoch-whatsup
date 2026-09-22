import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  domain: text("domain").notNull(),
  market: text("market").notNull(),
  phone: text("phone").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  initialMessage: text("initial_message").notNull(),
  followup1Message: text("followup_1_message").notNull(),
  followup2Message: text("followup_2_message").notNull(),
  finalMessage: text("final_message").notNull(),
});

export const outreach = sqliteTable("outreach", {
  leadId: text("lead_id").primaryKey().references(() => leads.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("Not sent"),
  lastContactDate: text("last_contact_date"),
  updatedAt: text("updated_at").notNull().default("1970-01-01T00:00:00.000Z"),
});
