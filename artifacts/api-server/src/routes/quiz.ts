import { Router } from "express";
import { db, quizQuestionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/question", async (_req, res) => {
  try {
    const [question] = await db
      .select()
      .from(quizQuestionsTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (!question) return res.status(404).json({ error: "No questions found" });
    const safe = { ...question, correctIndex: undefined };
    return res.json({ ...question });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/questions", async (_req, res) => {
  try {
    const results = await db.select().from(quizQuestionsTable).orderBy(quizQuestionsTable.createdAt);
    return res.json(results);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/questions", async (req, res) => {
  try {
    const { question, options, correctIndex, explanation } = req.body;
    const [q] = await db.insert(quizQuestionsTable).values({ question, options, correctIndex, explanation }).returning();
    return res.status(201).json(q);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/questions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { question, options, correctIndex, explanation } = req.body;
    const [q] = await db
      .update(quizQuestionsTable)
      .set({ question, options, correctIndex, explanation })
      .where(eq(quizQuestionsTable.id, id))
      .returning();
    return res.json(q);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/questions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.id, id));
    return res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/answer", async (req, res) => {
  try {
    const { questionId, selectedIndex } = req.body;
    const [question] = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.id, questionId));
    if (!question) return res.status(404).json({ error: "Question not found" });
    const correct = selectedIndex === question.correctIndex;
    return res.json({ correct, correctIndex: question.correctIndex, explanation: question.explanation });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
