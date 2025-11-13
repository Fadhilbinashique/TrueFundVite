import { sql } from "drizzle-orm";
import { pgTable, text, varchar, bigint, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  phone: text("phone"),
  profilePhotoUrl: text("profile_photo_url"),
  isNgo: boolean("is_ngo").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  location: text("location"),
  cause: text("cause").notNull(),
  goalAmount: bigint("goal_amount", { mode: "number" }).default(0),
  collectedAmount: bigint("collected_amount", { mode: "number" }).default(0),
  uniqueCode: text("unique_code").unique(),
  qrUrl: text("qr_url"),
  verified: boolean("verified").default(false),
  isTemporary: boolean("is_temporary").default(false),
  hospitalEmail: text("hospital_email"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
  donorName: text("donor_name"),
  donorId: varchar("donor_id").references(() => users.id),
  amount: bigint("amount", { mode: "number" }).notNull(),
  tipAmount: bigint("tip_amount", { mode: "number" }).default(0),
  type: text("type").default("donation"),
  released: boolean("released").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userName: text("user_name").notNull(),
  userImage: text("user_image"),
  reviewText: text("review_text").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ngoVerifications = pgTable("ngo_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  documentsUrl: text("documents_url"),
  verified: boolean("verified").default(false),
  requestedAt: timestamp("requested_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  uniqueCode: true,
  qrUrl: true,
  collectedAmount: true,
  verified: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  released: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertNgoVerificationSchema = createInsertSchema(ngoVerifications).omit({
  id: true,
  verified: true,
  requestedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertNgoVerification = z.infer<typeof insertNgoVerificationSchema>;
export type NgoVerification = typeof ngoVerifications.$inferSelect;
