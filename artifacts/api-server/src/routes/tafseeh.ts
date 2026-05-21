import { Router } from "express";
import { db } from "@workspace/db";
import { tafseehEntriesTable } from "@workspace/db";
import { ilike, eq } from "drizzle-orm";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

router.post("/auto", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "النص مطلوب" });

  try {
    // DB-first: check if we have pre-populated suggestions
    const trimmed = text.trim();
    const dbEntries = await db
      .select()
      .from(tafseehEntriesTable)
      .where(ilike(tafseehEntriesTable.originalText, `%${trimmed.slice(0, 30)}%`))
      .limit(5);

    if (dbEntries.length > 0) {
      const best = dbEntries[0];
      const suggestions = (best.suggestions as string[]).map((s) => ({ text: s }));
      return res.json({ original: text, suggestions, fromDb: true });
    }

    // AI fallback
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: `أنت مفصح لغوي متخصص في الأدب العربي الفصيح. مهمتك تحويل النصوص إلى نصوص فصيحة بليغة.
عند استلام نص، أعطِ اقتراحين فصيحين:
اقتراح أول وثاني بأساليب مختلفة.

أجب بتنسيق JSON فقط بهذا الشكل:
{
  "suggestions": [
    {"text": "النص المحسّن الأول"},
    {"text": "النص المحسّن الثاني"}
  ]
}`,
        },
        {
          role: "user",
          content: `فصّح هذا النص: ${text}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return res.json({ original: text, suggestions: parsed.suggestions ?? [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Admin: get all entries
router.get("/entries", async (_req, res) => {
  try {
    const entries = await db.select().from(tafseehEntriesTable).orderBy(tafseehEntriesTable.createdAt);
    return res.json(entries);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// Admin: add entry
router.post("/entries", async (req, res) => {
  try {
    const { originalText, suggestions } = req.body;
    const [entry] = await db
      .insert(tafseehEntriesTable)
      .values({ originalText, suggestions: suggestions ?? [] })
      .returning();
    return res.status(201).json(entry);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// Admin: update entry
router.put("/entries/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { originalText, suggestions } = req.body;
    const [entry] = await db
      .update(tafseehEntriesTable)
      .set({ originalText, suggestions: suggestions ?? [] })
      .where(eq(tafseehEntriesTable.id, id))
      .returning();
    return res.json(entry);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// Admin: delete entry
router.delete("/entries/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(tafseehEntriesTable).where(eq(tafseehEntriesTable.id, id));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
