import { Router } from "express";
import { db, dictionaryTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";

const router = Router();

router.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "");
  if (!q) return res.json([]);
  try {
    const results = await db
      .select()
      .from(dictionaryTable)
      .where(
        or(
          ilike(dictionaryTable.word, `%${q}%`),
          ilike(dictionaryTable.meaning, `%${q}%`),
          ilike(dictionaryTable.letter, `${q}%`)
        )
      )
      .limit(30);
    return res.json(results);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const offset = (page - 1) * limit;
  const bab = req.query.bab ? String(req.query.bab) : null;
  try {
    const whereClause = bab ? eq(dictionaryTable.bab, bab) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(dictionaryTable)
        .where(whereClause)
        .limit(limit).offset(offset)
        .orderBy(dictionaryTable.word),
      db.select({ count: sql<number>`count(*)` }).from(dictionaryTable).where(whereClause),
    ]);
    return res.json({ data, total: Number(totalResult[0]?.count ?? 0), page, limit });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { word, meaning, phrases, examples, category, letter, bab } = req.body;
    const [entry] = await db
      .insert(dictionaryTable)
      .values({ word, meaning, phrases: phrases ?? [], examples: examples ?? [], category, letter, bab })
      .returning();
    return res.status(201).json(entry);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { word, meaning, phrases, examples, category, letter, bab } = req.body;
    const [entry] = await db
      .update(dictionaryTable)
      .set({ word, meaning, phrases: phrases ?? [], examples: examples ?? [], category, letter, bab })
      .where(eq(dictionaryTable.id, id))
      .returning();
    return res.json(entry);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(dictionaryTable).where(eq(dictionaryTable.id, id));
    return res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
