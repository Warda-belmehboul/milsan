import { Router } from "express";
import { db } from "@workspace/db";
import { dictionaryTable, proofreadersTable, sessionsTable, rhymesTable, coursesTable, quizQuestionsTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [
      dictResult,
      proofreaderResult,
      sessionResult,
      rhymesResult,
      coursesResult,
      quizResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(dictionaryTable),
      db.select({ count: count() }).from(proofreadersTable),
      db.select({ count: count() }).from(sessionsTable),
      db.select({ count: count() }).from(rhymesTable),
      db.select({ count: count() }).from(coursesTable),
      db.select({ count: count() }).from(quizQuestionsTable),
    ]);

    return res.json({
      dictionaryCount: Number(dictResult[0]?.count ?? 0),
      proofreaderCount: Number(proofreaderResult[0]?.count ?? 0),
      sessionCount: Number(sessionResult[0]?.count ?? 0),
      rhymesCount: Number(rhymesResult[0]?.count ?? 0),
      coursesCount: Number(coursesResult[0]?.count ?? 0),
      quizQuestionsCount: Number(quizResult[0]?.count ?? 0),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
