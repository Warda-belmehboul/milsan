import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wordOrderingTable = pgTable("word_ordering", {
  id: serial("id").primaryKey(),
  words: jsonb("words").notNull().$type<string[]>().default([]),
  hint: text("hint"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWordOrderingSchema = createInsertSchema(wordOrderingTable).omit({ id: true, createdAt: true });
export type InsertWordOrdering = z.infer<typeof insertWordOrderingSchema>;
export type WordOrdering = typeof wordOrderingTable.$inferSelect;
