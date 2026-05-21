import { Router } from "express";
import { db, spellingTextsTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

router.get("/text", async (_req, res) => {
  try {
    const [text] = await db
      .select()
      .from(spellingTextsTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (!text) {
      return res.json({ id: 0, text: "الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين إياك نعبد وإياك نستعين", category: "قرآن كريم", audioUrl: null });
    }
    return res.json(text);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get reading texts (same table, filter by category=قراءة or just all)
router.get("/reading-text", async (_req, res) => {
  try {
    const [text] = await db
      .select()
      .from(spellingTextsTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (!text) {
      return res.json({ id: 0, text: "اللغة العربية هي إحدى أعرق اللغات في تاريخ البشرية، وأكثرها ثراءً وأوسعها انتشاراً في أرجاء الكرة الأرضية.", category: "عام", audioUrl: null });
    }
    return res.json(text);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/check", async (req, res) => {
  try {
    const { original, userInput } = req.body;
    const origWords = original.trim().split(/\s+/);
    const userWords = userInput.trim().split(/\s+/);
    const errors: Array<{ position: number; expected: string; got: string; rule: string }> = [];

    for (let i = 0; i < origWords.length; i++) {
      const expected = origWords[i];
      const got = userWords[i] ?? "";
      if (expected !== got) {
        errors.push({
          position: i,
          expected,
          got,
          rule: getSpellingRule(expected, got),
        });
      }
    }

    const correctCount = origWords.length - errors.length;
    const score = Math.round((correctCount / origWords.length) * 100);
    const feedback =
      score === 100
        ? "ممتاز! لا أخطاء إملائية"
        : score >= 80
        ? "جيد جداً! مع بعض الأخطاء البسيطة"
        : score >= 60
        ? "مقبول، تحتاج إلى مزيد من الممارسة"
        : "يحتاج إلى تدريب مكثف على الإملاء";

    return res.json({ score, errors, feedback });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// AI-powered reading check
router.post("/check-reading", async (req, res) => {
  try {
    const { original, recognized } = req.body;
    if (!original || !recognized) return res.status(400).json({ error: "النصان مطلوبان" });

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: `أنت مدقق لغوي متخصص في تقييم القراءة الصوتية. قارن النص الأصلي بما قرأه المستخدم وأعطِ تقييماً.
أجب بتنسيق JSON فقط:
{
  "score": <رقم من 0 إلى 100>,
  "feedback": "<تعليق مفيد بالعربية>",
  "errors": [{"expected": "الكلمة الصحيحة", "got": "ما قيل", "note": "ملاحظة"}]
}`,
        },
        {
          role: "user",
          content: `النص الأصلي: ${original}\nما قرأه المستخدم: ${recognized}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return res.json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/texts", async (req, res) => {
  try {
    const { text, category, audioUrl } = req.body;
    const [spellingText] = await db.insert(spellingTextsTable).values({ text, category, audioUrl }).returning();
    return res.status(201).json(spellingText);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/texts", async (_req, res) => {
  try {
    const texts = await db.select().from(spellingTextsTable);
    return res.json(texts);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/texts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { text, category, audioUrl } = req.body;
    const [updated] = await db.update(spellingTextsTable).set({ text, category, audioUrl }).where(eq(spellingTextsTable.id, id)).returning();
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/texts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(spellingTextsTable).where(eq(spellingTextsTable.id, id));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

function getSpellingRule(expected: string, got: string): string {
  if (!got) return "كلمة مفقودة";
  if (expected.includes("ة") && got.includes("ه")) return "الخلط بين التاء المربوطة والهاء";
  if (expected.includes("ا") && got.includes("أ")) return "الخلط بين الألف والهمزة";
  if (expected.includes("أ") && got.includes("ا")) return "حذف الهمزة";
  if (expected.includes("ئ") && got.includes("ي")) return "الخلط بين الياء والهمزة";
  if (expected.includes("ال") && !got.includes("ال")) return "حذف أل التعريف";
  if (expected.endsWith("ن") && !got.endsWith("ن")) return "حذف النون";
  return "خطأ إملائي عام";
}

export default router;
