import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const spellingTextsTable = pgTable("spelling_texts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category"),
  audioUrl: text("audio_url"),
});

export const insertSpellingTextSchema = createInsertSchema(spellingTextsTable).omit({ id: true });
export type InsertSpellingText = z.infer<typeof insertSpellingTextSchema>;
export type SpellingText = typeof spellingTextsTable.$inferSelect;
