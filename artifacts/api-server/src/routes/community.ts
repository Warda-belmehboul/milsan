import { Router } from "express";
import { db, postsTable, postRepliesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/posts", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(postsTable);
    return res.json({ data: posts, total: Number(count), page, limit });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const { title, content, authorName, category } = req.body;
    if (!title || !content || !authorName) return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    const initial = authorName.trim().charAt(0) || "م";
    const [post] = await db.insert(postsTable).values({
      title, content, authorName, authorInitial: initial,
      category: category || "عام",
    }).returning();
    return res.status(201).json(post);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, Number(req.params.id)));
    if (!post) return res.status(404).json({ error: "Not found" });
    const replies = await db.select().from(postRepliesTable).where(eq(postRepliesTable.postId, post.id)).orderBy(postRepliesTable.createdAt);
    return res.json({ post, replies });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/posts/:id/reply", async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { content, authorName } = req.body;
    if (!content || !authorName) return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    const initial = authorName.trim().charAt(0) || "م";
    const [reply] = await db.insert(postRepliesTable).values({ postId, content, authorName, authorInitial: initial }).returning();
    await db.update(postsTable).set({ repliesCount: sql`${postsTable.repliesCount} + 1` }).where(eq(postsTable.id, postId));
    return res.status(201).json(reply);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/posts/:id/like", async (req, res) => {
  try {
    const postId = Number(req.params.id);
    await db.update(postsTable).set({ likesCount: sql`${postsTable.likesCount} + 1` }).where(eq(postsTable.id, postId));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    await db.delete(postsTable).where(eq(postsTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
