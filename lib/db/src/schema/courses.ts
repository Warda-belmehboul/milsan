import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemLinkSchema = z.object({
  text: z.string(),
  link: z.string().optional(),
});

export const phaseSchema = z.object({
  month: z.number(),
  title: z.string(),
  hafizat_quran: z.array(itemLinkSchema).optional().default([]),
  hafizat_hadith: z.array(itemLinkSchema).optional().default([]),
  hafizat_poetry: z.array(itemLinkSchema).optional().default([]),
  readings: z.array(itemLinkSchema).optional().default([]),
  videos: z.array(itemLinkSchema).optional().default([]),
});

export type ItemLink = z.infer<typeof itemLinkSchema>;
export type Phase = z.infer<typeof phaseSchema>;

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  level: text("level", { enum: ["مبتدئ", "متوسط", "متقدم"] }).default("مبتدئ").notNull(),
  duration: text("duration").notNull(),
  link: text("link").notNull(),
  isFree: boolean("is_free").default(true).notNull(),
  price: text("price"),
  phases: jsonb("phases").$type<Phase[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
