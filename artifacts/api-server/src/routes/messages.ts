import { Router } from "express";
import { db, messagesTable, proofreadersTable } from "@workspace/db";
import { eq, and, desc, isNull } from "drizzle-orm";

const router = Router();

router.post("/:proofreaderId", async (req, res) => {
  try {
    const proofreaderId = Number(req.params.proofreaderId);
    const { senderName, senderEmail, content } = req.body;
    if (!senderName || !senderEmail || !content) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }
    const [pr] = await db.select().from(proofreadersTable).where(eq(proofreadersTable.id, proofreaderId));
    if (!pr) return res.status(404).json({ error: "المفصح غير موجود" });

    const [msg] = await db.insert(messagesTable).values({
      proofreaderId, senderName, senderEmail, content,
      isFromProofreader: false, isRead: false,
    }).returning();
    return res.status(201).json(msg);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/inbox", async (req, res) => {
  try {
    const { email } = req.query as { email: string };
    if (!email) return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });

    const [pr] = await db.select().from(proofreadersTable).where(eq(proofreadersTable.email, email));
    if (!pr) return res.status(404).json({ error: "لم يُعثر على حساب بهذا البريد" });

    const threads = await db.select().from(messagesTable)
      .where(and(eq(messagesTable.proofreaderId, pr.id), isNull(messagesTable.threadId)))
      .orderBy(desc(messagesTable.createdAt));

    const allReplies = await db.select().from(messagesTable)
      .where(and(eq(messagesTable.proofreaderId, pr.id)))
      .orderBy(messagesTable.createdAt);

    const result = threads.map(t => ({
      ...t,
      replies: allReplies.filter(r => r.threadId === t.id),
    }));

    await db.update(messagesTable)
      .set({ isRead: true })
      .where(and(eq(messagesTable.proofreaderId, pr.id), eq(messagesTable.isFromProofreader, false)));

    return res.json({ proofreader: pr, threads: result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:messageId/reply", async (req, res) => {
  try {
    const messageId = Number(req.params.messageId);
    const { proofreaderEmail, content } = req.body;
    if (!proofreaderEmail || !content) return res.status(400).json({ error: "جميع الحقول مطلوبة" });

    const [original] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId));
    if (!original) return res.status(404).json({ error: "الرسالة غير موجودة" });

    const [pr] = await db.select().from(proofreadersTable)
      .where(and(eq(proofreadersTable.id, original.proofreaderId), eq(proofreadersTable.email, proofreaderEmail)));
    if (!pr) return res.status(403).json({ error: "غير مصرح لك بالرد" });

    const [reply] = await db.insert(messagesTable).values({
      proofreaderId: original.proofreaderId,
      threadId: original.threadId ?? original.id,
      senderName: pr.name,
      senderEmail: proofreaderEmail,
      content,
      isFromProofreader: true,
      isRead: false,
    }).returning();
    return res.status(201).json(reply);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
