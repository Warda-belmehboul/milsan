import { Router } from "express";
import { db } from "@workspace/db";
import { wordOrderingTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/random", async (_req, res) => {
  try {
    const [exercise] = await db
      .select()
      .from(wordOrderingTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (!exercise) {
      return res.json(null);
    }
    return res.json(exercise);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const exercises = await db.select().from(wordOrderingTable).orderBy(wordOrderingTable.createdAt);
    return res.json(exercises);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { words, hint } = req.body;
    if (!words || !Array.isArray(words) || words.length < 2) {
      return res.status(400).json({ error: "مطلوب كلمتان على الأقل" });
    }
    const [exercise] = await db
      .insert(wordOrderingTable)
      .values({ words, hint })
      .returning();
    return res.status(201).json(exercise);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { words, hint } = req.body;
    if (!words || !Array.isArray(words) || words.length < 2) {
      return res.status(400).json({ error: "مطلوب كلمتان على الأقل" });
    }
    const [exercise] = await db
      .update(wordOrderingTable)
      .set({ words, hint })
      .where(eq(wordOrderingTable.id, id))
      .returning();
    return res.json(exercise);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(wordOrderingTable).where(eq(wordOrderingTable.id, id));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
