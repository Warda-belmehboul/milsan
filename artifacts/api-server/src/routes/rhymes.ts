import { Router } from "express";
import { db, rhymesTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const offset = (page - 1) * limit;
  const q = String(req.query.q ?? "");
  const bab = req.query.bab ? String(req.query.bab) : null;
  try {
    let whereClause: any = undefined;
    if (q) whereClause = ilike(rhymesTable.phrase, `%${q}%`);
    else if (bab) whereClause = eq(rhymesTable.category, bab);
    const [data, totalResult] = await Promise.all([
      db.select().from(rhymesTable).where(whereClause).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(rhymesTable).where(whereClause),
    ]);
    return res.json({ data, total: Number(totalResult[0]?.count ?? 0), page, limit });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { phrase, explanation, category } = req.body;
    const [rhyme] = await db.insert(rhymesTable).values({ phrase, explanation, category }).returning();
    return res.status(201).json(rhyme);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { phrase, explanation, category } = req.body;
    const [rhyme] = await db.update(rhymesTable).set({ phrase, explanation, category }).where(eq(rhymesTable.id, id)).returning();
    return res.json(rhyme);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(rhymesTable).where(eq(rhymesTable.id, id));
    return res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
