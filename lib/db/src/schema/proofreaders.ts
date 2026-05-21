import { pgTable, text, serial, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const proofreadersTable = pgTable("proofreaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  specialization: text("specialization").notNull(),
  email: text("email").notNull(),
  rating: doublePrecision("rating").default(5.0).notNull(),
  pricePerHour: doublePrecision("price_per_hour").notNull(),
  sessionsCount: integer("sessions_count").default(0).notNull(),
  status: text("status", { enum: ["pending", "approved", "suspended"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProofreaderSchema = createInsertSchema(proofreadersTable).omit({ id: true, createdAt: true, rating: true, sessionsCount: true });
export type InsertProofreader = z.infer<typeof insertProofreaderSchema>;
export type Proofreader = typeof proofreadersTable.$inferSelect;

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  proofreaderId: integer("proofreader_id").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  text: text("text"),
  price: doublePrecision("price").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed", "cancelled"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
