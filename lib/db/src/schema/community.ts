import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const postsTable = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorInitial: text("author_initial").notNull(),
  category: text("category").default("عام").notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  repliesCount: integer("replies_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postRepliesTable = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorInitial: text("author_initial").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Post = typeof postsTable.$inferSelect;
export type PostReply = typeof postRepliesTable.$inferSelect;
