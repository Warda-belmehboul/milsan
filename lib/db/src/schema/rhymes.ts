import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rhymesTable = pgTable("rhymes", {
  id: serial("id").primaryKey(),
  phrase: text("phrase").notNull(),
  explanation: text("explanation").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRhymeSchema = createInsertSchema(rhymesTable).omit({ id: true, createdAt: true });
export type InsertRhyme = z.infer<typeof insertRhymeSchema>;
export type Rhyme = typeof rhymesTable.$inferSelect;
