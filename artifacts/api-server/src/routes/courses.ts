import { Router } from "express";
import { db, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const results = await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
    return res.json(results);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, Number(req.params.id)));
    if (!course) return res.status(404).json({ error: "Not found" });
    return res.json(course);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, instructor, level, duration, link, isFree, phases } = req.body;
    if (!title || !instructor || !link) return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    const [course] = await db.insert(coursesTable).values({
      title, description: description || "", instructor,
      level: level || "مبتدئ",
      duration: duration || "",
      link, isFree: isFree ?? true,
      phases: phases || [],
    }).returning();
    return res.status(201).json(course);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, instructor, level, duration, link, isFree, phases } = req.body;
    const [course] = await db.update(coursesTable)
      .set({ title, description, instructor, level, duration, link, isFree, phases })
      .where(eq(coursesTable.id, id))
      .returning();
    return res.json(course);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(coursesTable).where(eq(coursesTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
