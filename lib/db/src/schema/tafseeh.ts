import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tafseehEntriesTable = pgTable("tafseeh_entries", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  suggestions: jsonb("suggestions").notNull().$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTafseehEntrySchema = createInsertSchema(tafseehEntriesTable).omit({ id: true, createdAt: true });
export type InsertTafseehEntry = z.infer<typeof insertTafseehEntrySchema>;
export type TafseehEntry = typeof tafseehEntriesTable.$inferSelect;
