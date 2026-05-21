import { Router } from "express";
import { db, proofreadersTable, sessionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import nodemailer from "nodemailer";

const router = Router();

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

async function sendApprovalEmail(to: string, name: string) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn("Email not configured — skipping approval email.");
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"مِلْسَان" <${process.env.MAIL_USER}>`,
      to,
      subject: "تهانينا! تم قبول حسابك في منصة مِلْسَان",
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff8f2; border-radius: 16px; overflow: hidden; border: 1px solid #e8d5c0;">
          <div style="background: #7B4A1A; padding: 32px 40px; text-align: center;">
            <h1 style="color: #fff; font-size: 28px; margin: 0; letter-spacing: 2px;">مِلْسَان</h1>
            <p style="color: #f0d9c0; margin: 8px 0 0; font-size: 14px;">بَوَّابَتُكَ لِتَأنِيقِ لُغَتِك</p>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #7B4A1A; margin-top: 0;">أهلاً ${name}،</h2>
            <p style="color: #4a3728; line-height: 1.8; font-size: 16px;">
              يسعدنا إخبارك بأنه <strong>تم قبول حسابك</strong> كمفصح معتمد في منصة مِلْسَان.
            </p>
            <p style="color: #4a3728; line-height: 1.8; font-size: 16px;">
              يمكنك الآن الدخول إلى لوحة المفصح وبدء تلقّي طلبات التفصيح من المستخدمين.
            </p>
            <div style="background: #7B4A1A; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #fff; font-size: 15px; margin: 0; font-style: italic;">
                "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ"
              </p>
            </div>
            <p style="color: #7a6a5a; font-size: 13px; margin-top: 32px; border-top: 1px solid #e8d5c0; padding-top: 16px;">
              فريق مِلْسَان — منصة التفصيح وتحسين الأسلوب
            </p>
          </div>
        </div>
      `,
    });
    console.log(`Approval email sent to ${to}`);
  } catch (e) {
    console.error("Failed to send approval email:", e);
  }
}

router.get("/", async (_req, res) => {
  try {
    const results = await db.select().from(proofreadersTable).orderBy(proofreadersTable.createdAt);
    return res.json(results);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [proofreader] = await db.select().from(proofreadersTable).where(eq(proofreadersTable.id, id));
    if (!proofreader) return res.status(404).json({ error: "Not found" });
    return res.json(proofreader);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, bio, specialization, pricePerHour, email } = req.body;
    const [proofreader] = await db
      .insert(proofreadersTable)
      .values({ name, bio, specialization, pricePerHour, email, status: "pending" })
      .returning();
    return res.status(201).json(proofreader);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, name, bio, specialization, pricePerHour, email } = req.body;

    const [before] = await db.select().from(proofreadersTable).where(eq(proofreadersTable.id, id));

    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (specialization !== undefined) updateFields.specialization = specialization;
    if (pricePerHour !== undefined) updateFields.pricePerHour = pricePerHour;
    if (email !== undefined) updateFields.email = email;

    const [proofreader] = await db
      .update(proofreadersTable)
      .set(updateFields)
      .where(eq(proofreadersTable.id, id))
      .returning();

    if (status === "approved" && before?.status !== "approved" && proofreader.email) {
      sendApprovalEmail(proofreader.email, proofreader.name);
    }

    return res.json(proofreader);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/sessions", async (req, res) => {
  try {
    const proofreaderId = Number(req.params.id);
    const { clientName, clientEmail, text, price } = req.body;
    const [session] = await db
      .insert(sessionsTable)
      .values({ proofreaderId, clientName, clientEmail, text, price, status: "pending" })
      .returning();
    await db
      .update(proofreadersTable)
      .set({ sessionsCount: sql`${proofreadersTable.sessionsCount} + 1` })
      .where(eq(proofreadersTable.id, proofreaderId));
    return res.status(201).json(session);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
