import { Router } from "express";
import { db, sessionsTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const results = await db.select().from(sessionsTable).orderBy(sessionsTable.createdAt);
    return res.json(results);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
