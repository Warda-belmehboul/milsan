import { useState } from "react";
import { Layout } from "@/components/layout";
import { useRegisterProofreader } from "@workspace/api-client-react";
import { PenLine, CheckCircle2, UserPlus, Star, Clock, DollarSign, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Join() {
  const { mutate, isPending, isSuccess, error } = useRegisterProofreader();
  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    bio: "",
    pricePerHour: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      data: {
        name: form.name,
        email: form.email,
        specialization: form.specialization,
        bio: form.bio,
        pricePerHour: Number(form.pricePerHour),
        status: "pending",
      },
    });
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-10 rounded-3xl text-center max-w-lg w-full"
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <p className="text-2xl font-display font-bold text-foreground">
              سيتم مراجعة طلبك ...
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">
            انضم كمفصح
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            شارك خبرتك اللغوية مع آلاف المستخدمين، وابنِ سمعتك في عالم التدقيق اللغوي والبلاغة العربية.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Benefits */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-6">مزايا الانضمام</h3>
            {[
              { icon: Star, title: "بناء سمعة مهنية", desc: "تقييمات حقيقية من عملائك تعزز مصداقيتك" },
              { icon: DollarSign, title: "دخل إضافي", desc: "حدد سعرك بنفسك واستقبل حجوزات مباشرة" },
              { icon: Clock, title: "جدول مرن", desc: "اختر مواعيدك وعدد الجلسات التي تناسبك" },
              { icon: Mail, title: "تواصل مباشر", desc: "نظام رسائل داخلي للتواصل مع العملاء" },
            ].map((b) => (
              <div key={b.title} className="glass-panel p-5 rounded-2xl flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{b.title}</h4>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <PenLine className="w-5 h-5 text-primary" /> بيانات التسجيل
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                  label="الاسم الكامل *"
                  type="text"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="أحمد بن عبدالله"
                  required
                />
                <Field
                  label="البريد الإلكتروني *"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-muted-foreground">التخصص *</label>
                  <select
                    required
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                  >
                    <option value="">اختر تخصصك...</option>
                    <option value="تدقيق لغوي وإملائي">تدقيق لغوي وإملائي</option>
                    <option value="البلاغة والأسلوب">البلاغة والأسلوب</option>
                    <option value="الشعر والإنشاء">الشعر والإنشاء</option>
                    <option value="اللغة العربية الفصحى">اللغة العربية الفصحى</option>
                    <option value="الترجمة الأدبية">الترجمة الأدبية</option>
                    <option value="الخطابة والإلقاء">الخطابة والإلقاء</option>
                  </select>
                </div>
                <Field
                  label="السعر بالساعة (دولار) *"
                  type="number"
                  value={form.pricePerHour}
                  onChange={(v) => setForm({ ...form, pricePerHour: v })}
                  placeholder="25"
                  required
                  min="5"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-muted-foreground">نبذة عنك *</label>
                <textarea
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="اكتب نبذة مختصرة عن خبرتك ومؤهلاتك وما تقدمه للعملاء..."
                  dir="rtl"
                  rows={5}
                  className="w-full p-4 rounded-xl bg-background border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm resize-none leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مجدداً.
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-yellow-600 text-primary-foreground shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري إرسال الطلب...</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> تقديم طلب الانضمام</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Field({
  label, type, value, onChange, placeholder, required, min
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  required?: boolean; min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2 text-muted-foreground">{label}</label>
      <input
        type={type}
        required={required}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={type === "email" ? "ltr" : "rtl"}
        className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
      />
    </div>
  );
}
