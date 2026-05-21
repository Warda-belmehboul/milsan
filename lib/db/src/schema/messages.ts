import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { proofreadersTable } from "./proofreaders";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  proofreaderId: integer("proofreader_id").notNull().references(() => proofreadersTable.id, { onDelete: "cascade" }),
  threadId: integer("thread_id"),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  content: text("content").notNull(),
  isFromProofreader: boolean("is_from_proofreader").default(false).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
