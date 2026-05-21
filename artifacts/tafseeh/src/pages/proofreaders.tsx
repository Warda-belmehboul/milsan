import { useState } from "react";
import { Layout } from "@/components/layout";
import { Users, Star, Clock, MessageCircle, Calendar } from "lucide-react";
import { useGetProofreaders, useCreateSession } from "@workspace/api-client-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

type Proofreader = {
  id: number;
  name: string;
  email: string;
  bio: string;
  specialization: string;
  rating: number;
  pricePerHour: number;
  sessionsCount: number;
  status: string;
};

type DialogMode = "book" | "message";

export default function Proofreaders() {
  const { data: proofreaders, isLoading } = useGetProofreaders();
  const [selectedPR, setSelectedPR] = useState<Proofreader | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("book");

  const approved = (proofreaders as Proofreader[] | undefined)?.filter(p => p.status === "approved") || [];

  const openDialog = (pr: Proofreader, mode: DialogMode) => {
    setSelectedPR(pr);
    setDialogMode(mode);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Users className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">نخبة المفصحين</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختر خبيراً لغوياً لمراجعة وتدقيق نصوصك بلمسة إنسانية خبيرة.
          </p>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
          >
            هل أنت خبير لغوي؟ انضم كمفصح
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : approved.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>لا يوجد مفصحون معتمدون حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {approved.map((pr, i) => (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel p-6 rounded-2xl hover-lift flex flex-col h-full"
              >
                {/* Avatar + Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-2xl font-display font-bold text-primary flex-shrink-0 border border-primary/20">
                    {pr.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground leading-tight truncate">{pr.name}</h3>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
                      {pr.specialization}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-card px-2 py-1 rounded-lg border border-border flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm">{pr.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-5 flex-1 text-sm leading-relaxed line-clamp-3">
                  {pr.bio}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5 pb-5 border-b border-border">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {pr.sessionsCount} جلسة مكتملة
                  </span>
                </div>

                {/* Price + Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">{pr.pricePerHour}</span>
                    <span className="text-xs text-muted-foreground mr-1">دولار / ساعة</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDialog(pr, "message")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground rounded-xl font-bold text-sm transition-all"
                      title="راسل المفصح"
                    >
                      <MessageCircle className="w-4 h-4 text-primary" />
                      راسل
                    </button>
                    <button
                      onClick={() => openDialog(pr, "book")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-bold text-sm transition-colors shadow-md"
                    >
                      <Calendar className="w-4 h-4" />
                      احجز
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedPR && (
            dialogMode === "book" ? (
              <BookingDialog proofreader={selectedPR} onClose={() => setSelectedPR(null)} />
            ) : (
              <MessageDialog proofreader={selectedPR} onClose={() => setSelectedPR(null)} />
            )
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

/* ─── Booking Dialog ─── */
function BookingDialog({ proofreader, onClose }: { proofreader: Proofreader; onClose: () => void }) {
  const { mutate, isPending } = useCreateSession();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", text: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      id: proofreader.id,
      data: { clientName: form.name, clientEmail: form.email, text: form.text, price: proofreader.pricePerHour },
    }, {
      onSuccess: () => {
        toast({ title: "تم طلب الحجز بنجاح!", description: "سيتم التواصل معك قريباً لتأكيد الموعد." });
        onClose();
      },
      onError: () => toast({ title: "خطأ", description: "حدث خطأ أثناء تقديم الطلب.", variant: "destructive" }),
    });
  };

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" /> حجز جلسة مع {proofreader.name}
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">التكلفة: {proofreader.pricePerHour} دولار للساعة</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="الاسم" type="text" required value={form.name} onChange={v => setForm({ ...form, name: v })} />
        <FormField label="البريد الإلكتروني" type="email" required value={form.email} onChange={v => setForm({ ...form, email: v })} ltr />
        <div>
          <label className="block text-sm font-bold mb-1 text-muted-foreground">نبذة عن النص (اختياري)</label>
          <textarea
            value={form.text}
            onChange={e => setForm({ ...form, text: e.target.value })}
            className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary resize-none h-24 text-sm"
            dir="rtl"
          />
        </div>
        <DialogActions onClose={onClose} isPending={isPending} submitLabel="تأكيد الحجز" />
      </form>
    </Overlay>
  );
}

/* ─── Message Dialog ─── */
async function postMessage(proofreaderId: number, data: { senderName: string; senderEmail: string; content: string }) {
  const res = await fetch(`/api/messages/${proofreaderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("فشل الإرسال");
  return res.json();
}

function MessageDialog({ proofreader, onClose }: { proofreader: Proofreader; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () => postMessage(proofreader.id, form),
    onSuccess: () => toast({ title: "تم إرسال رسالتك!", description: "سيرد عليك المفصح قريباً." }),
    onError: () => toast({ title: "خطأ", description: "حدث خطأ أثناء الإرسال.", variant: "destructive" }),
  });

  if (isSuccess) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">تم الإرسال!</h3>
          <p className="text-muted-foreground mb-6">
            رسالتك وصلت إلى {proofreader.name}. سيرد عليك على بريدك الإلكتروني.
          </p>
          <button onClick={onClose} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl">إغلاق</button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-2xl font-display font-bold mb-1 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" /> رسالة إلى {proofreader.name}
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">{proofreader.specialization}</p>
      <form
        onSubmit={e => { e.preventDefault(); mutate(); }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="اسمك *" type="text" required value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <FormField label="بريدك الإلكتروني *" type="email" required value={form.email} onChange={v => setForm({ ...form, email: v })} ltr />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-muted-foreground">رسالتك *</label>
          <textarea
            required
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="اكتب رسالتك هنا..."
            className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary resize-none h-32 text-sm leading-relaxed"
            dir="rtl"
          />
        </div>
        <DialogActions onClose={onClose} isPending={isPending} submitLabel="إرسال الرسالة" icon={<MessageCircle className="w-4 h-4" />} />
      </form>
    </Overlay>
  );
}

/* ─── Shared UI ─── */
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-lg rounded-2xl p-6 md:p-8"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, type, value, onChange, required, ltr }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; required?: boolean; ltr?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-1 text-muted-foreground">{label}</label>
      <input
        type={type} required={required} value={value}
        onChange={e => onChange(e.target.value)}
        dir={ltr ? "ltr" : "rtl"}
        className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm"
      />
    </div>
  );
}

function DialogActions({ onClose, isPending, submitLabel, icon }: {
  onClose: () => void; isPending: boolean; submitLabel: string; icon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={isPending}
        className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : icon}
        {isPending ? "جاري الإرسال..." : submitLabel}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-3 bg-card border border-border text-foreground font-bold rounded-xl hover:bg-muted"
      >
        إلغاء
      </button>
    </div>
  );
}
