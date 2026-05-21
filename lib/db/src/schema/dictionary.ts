import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const DICTIONARY_BABS = [
  "الصفات والأخلاق الحسنة",
  "الصفات والأخلاق السيئة",
  "الغنى والفقر",
  "الكرم والبخل",
  "الأزمنة والأمكنة",
  "الحروب والعداء",
  "المشاعر والأحاسيس",
  "الأطوار والأسنان",
  "حكم ومواعظ",
  "الأدعية",
  "العلاقات والمعاملات",
] as const;

export const dictionaryTable = pgTable("dictionary", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  phrases: jsonb("phrases").notNull().$type<string[]>().default([]),
  examples: jsonb("examples").notNull().$type<string[]>().default([]),
  category: text("category"),
  letter: text("letter"),
  bab: text("bab"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDictionarySchema = createInsertSchema(dictionaryTable).omit({ id: true, createdAt: true });
export type InsertDictionary = z.infer<typeof insertDictionarySchema>;
export type Dictionary = typeof dictionaryTable.$inferSelect;
