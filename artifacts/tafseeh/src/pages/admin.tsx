import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  useGetAdminStats, useGetProofreaders, useUpdateProofreader,
  useGetDictionaryEntries, useCreateDictionaryEntry, useDeleteDictionaryEntry, useUpdateDictionaryEntry,
  useGetRhymes, useCreateRhyme, useDeleteRhyme, useUpdateRhyme,
  useGetCourses, useCreateCourse, useDeleteCourse, useUpdateCourse,
  useGetQuizQuestions, useCreateQuizQuestion, useDeleteQuizQuestion,
  useCreateSpellingText,
} from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ShieldCheck, UserCheck, XCircle, CheckCircle, Book, FileText,
  GraduationCap, Gamepad2, Mic, PlusCircle, Trash2, BarChart2, PenTool, Shuffle, Pencil
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "stats", label: "الإحصائيات", icon: BarChart2 },
  { id: "proofreaders", label: "المفصحون", icon: UserCheck },
  { id: "dictionary", label: "المعجم", icon: Book },
  { id: "rhymes", label: "معجم العبارات البديعة", icon: FileText },
  { id: "tafseeh", label: "التفصيح", icon: PenTool },
  { id: "courses", label: "الدورات", icon: GraduationCap },
  { id: "quiz", label: "الأسئلة", icon: Gamepad2 },
  { id: "ordering", label: "لعبة الترتيب", icon: Shuffle },
  { id: "spelling", label: "الإملاء", icon: Mic },
];

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);

  if (!auth) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-sm text-center">
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">لوحة تحكم المدير</h2>
            <p className="text-muted-foreground text-sm mb-6">أدخل كلمة المرور للمتابعة</p>
            <form onSubmit={e => {
              e.preventDefault();
              if (pass === 'admin123') { setAuth(true); setPassError(false); }
              else { setPassError(true); setPass(""); }
            }}>
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setPassError(false); }}
                placeholder="كلمة المرور..."
                className={`w-full p-3 rounded-xl bg-background border text-center mb-4 outline-none focus:border-primary ${passError ? 'border-destructive' : 'border-border'}`}
              />
              {passError && <p className="text-destructive text-sm mb-3">كلمة المرور غير صحيحة</p>}
              <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
                دخول
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-display font-bold text-primary mb-8 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" /> لوحة تحكم الإدارة
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 glass-panel p-2 rounded-2xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "stats" && <StatsPanel />}
        {activeTab === "proofreaders" && <ProofreadersPanel />}
        {activeTab === "dictionary" && <DictionaryPanel />}
        {activeTab === "rhymes" && <RhymesPanel />}
        {activeTab === "tafseeh" && <TafseehEntriesPanel />}
        {activeTab === "courses" && <CoursesPanel />}
        {activeTab === "quiz" && <QuizPanel />}
        {activeTab === "ordering" && <WordOrderingPanel />}
        {activeTab === "spelling" && <SpellingPanel />}
      </div>
    </Layout>
  );
}

/* ─── Stats ─── */
function StatsPanel() {
  const { data: stats, isLoading } = useGetAdminStats();
  const chartData = stats ? [
    { name: 'المعجم', count: stats.dictionaryCount },
    { name: 'المفصحون', count: stats.proofreaderCount },
    { name: 'الجلسات', count: stats.sessionCount },
    { name: 'السجع', count: stats.rhymesCount },
    { name: 'الدورات', count: stats.coursesCount },
    { name: 'الأسئلة', count: stats.quizQuestionsCount },
  ] : [];

  if (isLoading) return <Loading />;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl h-80">
        <h3 className="text-lg font-bold mb-6 text-muted-foreground">إحصائيات المنصة</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {chartData.map(stat => (
          <div key={stat.name} className="glass-panel p-4 rounded-xl flex flex-col justify-center items-center text-center">
            <span className="text-3xl font-bold text-foreground mb-1">{stat.count}</span>
            <span className="text-sm text-muted-foreground">{stat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Proofreaders ─── */
function ProofreadersPanel() {
  const { data: proofreaders, isLoading } = useGetProofreaders();
  const { mutate: update } = useUpdateProofreader();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", bio: "", specialization: "", pricePerHour: "", email: "" });

  const handleStatus = (id: number, status: 'approved' | 'suspended', prEmail?: string, prName?: string) => {
    update({ id, data: { status } as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/proofreaders'] });
        if (status === 'approved') {
          toast({ title: `تم قبول ${prName} ✓`, description: prEmail ? `تم إرسال إشعار إلى ${prEmail}` : undefined });
        } else {
          toast({ title: "تم إيقاف الحساب" });
        }
      }
    });
  };

  const startEdit = (pr: any) => {
    setEditingId(pr.id);
    setEditForm({ name: pr.name, bio: pr.bio ?? "", specialization: pr.specialization ?? "", pricePerHour: pr.pricePerHour ?? "", email: pr.email ?? "" });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    update({ id: editingId, data: { ...editForm, pricePerHour: editForm.pricePerHour || undefined } as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/proofreaders'] });
        toast({ title: "تم تحديث بيانات المفصح" });
        setEditingId(null);
      }
    });
  };

  if (isLoading) return <Loading />;
  return (
    <div className="space-y-4">
      {editingId !== null && (
        <form onSubmit={handleUpdate} className="glass-panel p-6 rounded-2xl space-y-4 border-2 border-primary/20">
          <h4 className="font-bold text-primary">تعديل بيانات المفصح</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الاسم *" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} />
            <Field label="البريد الإلكتروني" value={editForm.email} onChange={v => setEditForm({ ...editForm, email: v })} />
            <Field label="التخصص" value={editForm.specialization} onChange={v => setEditForm({ ...editForm, specialization: v })} />
            <Field label="السعر بالساعة" value={editForm.pricePerHour} onChange={v => setEditForm({ ...editForm, pricePerHour: v })} />
          </div>
          <Field label="نبذة تعريفية" value={editForm.bio} onChange={v => setEditForm({ ...editForm, bio: v })} textarea />
          <div className="flex gap-3">
            <button type="submit" disabled={!editForm.name} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">حفظ التعديلات</button>
            <button type="button" onClick={() => setEditingId(null)} className="px-6 py-2 bg-card border border-border rounded-xl font-bold">إلغاء</button>
          </div>
        </form>
      )}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border text-sm">
              <tr>
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">البريد</th>
                <th className="p-4 font-medium">التخصص</th>
                <th className="p-4 font-medium">السعر</th>
                <th className="p-4 font-medium">الجلسات</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proofreaders?.map(pr => (
                <tr key={pr.id} className={`hover:bg-card/50 transition-colors ${editingId === pr.id ? 'bg-primary/5' : ''}`}>
                  <td className="p-4 font-bold">{pr.name}</td>
                  <td className="p-4 text-xs text-muted-foreground">{(pr as any).email || "—"}</td>
                  <td className="p-4 text-muted-foreground text-sm">{pr.specialization}</td>
                  <td className="p-4">{pr.pricePerHour ? `${pr.pricePerHour}$/س` : "—"}</td>
                  <td className="p-4 text-center">{pr.sessionsCount ?? 0}</td>
                  <td className="p-4"><StatusBadge status={pr.status} /></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(pr)} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20" title="تعديل">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {pr.status !== 'approved' && (
                        <button onClick={() => handleStatus(pr.id, 'approved', (pr as any).email, pr.name)} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20" title="اعتماد وإرسال بريد">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {pr.status !== 'suspended' && (
                        <button onClick={() => handleStatus(pr.id, 'suspended')} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20" title="إيقاف">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const BABS = [
  "الصفات والأخلاق الحسنة","الصفات والأخلاق السيئة","الغنى والفقر",
  "الكرم والبخل","الأزمنة والأمكنة","الحروب والعداء","المشاعر والأحاسيس",
  "الأطوار والأسنان","حكم ومواعظ","الأدعية","العلاقات والمعاملات",
];

const ARABIC_LETTERS = ["أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"];

/* ─── Dictionary ─── */
function DictionaryPanel() {
  const { data: list, isLoading } = useGetDictionaryEntries({ page: 1, limit: 50 });
  const { mutate: create, isPending: isCreating } = useCreateDictionaryEntry();
  const { mutate: update, isPending: isUpdating } = useUpdateDictionaryEntry();
  const { mutate: del } = useDeleteDictionaryEntry();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const emptyForm = { word: "", meaning: "", phrases: "", examples: "", letter: "" };
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const startEdit = (entry: any) => {
    setOpen(false);
    setEditingId(entry.id);
    setForm({
      word: entry.word ?? "",
      meaning: entry.meaning ?? "",
      phrases: (entry.phrases ?? []).join("\n"),
      examples: (entry.examples ?? []).join("\n"),
      letter: entry.letter ?? "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      word: form.word, meaning: form.meaning,
      phrases: form.phrases.split("\n").filter(Boolean),
      examples: form.examples.split("\n").filter(Boolean),
      letter: form.letter || undefined,
    } as any;
    if (editingId !== null) {
      update({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
          toast({ title: "تم التحديث بنجاح" });
          setEditingId(null); setForm(emptyForm);
        }
      });
    } else {
      create({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] });
          toast({ title: "تمت الإضافة بنجاح" });
          setForm(emptyForm); setOpen(false);
        }
      });
    }
  };

  if (isLoading) return <Loading />;

  const isFormOpen = open || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">العبارات ({list?.total ?? 0})</h3>
        <button onClick={() => { setOpen(!open); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          <PlusCircle className="w-4 h-4" /> إضافة عبارة
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border-2 border-primary/20">
          <h4 className="font-bold text-primary">{editingId !== null ? "تعديل العبارة" : "عبارة جديدة"}</h4>
          <Field label="العبارة الفصيحة *" value={form.word} onChange={v => setForm({ ...form, word: v })} />
          <Field label="الشرح *" value={form.meaning} onChange={v => setForm({ ...form, meaning: v })} textarea />
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">الحرف</label>
            <select value={form.letter} onChange={e => setForm({ ...form, letter: e.target.value })}
              className="w-full p-2 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm">
              <option value="">اختر الحرف...</option>
              {ARABIC_LETTERS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <Field label="عبارات إضافية (سطر لكل عبارة)" value={form.phrases} onChange={v => setForm({ ...form, phrases: v })} textarea />
          <div className="flex gap-3">
            <button type="submit" disabled={(editingId !== null ? isUpdating : isCreating) || !form.word || !form.meaning}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">
              {(editingId !== null ? isUpdating : isCreating) ? "جاري الحفظ..." : editingId !== null ? "تحديث" : "حفظ"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditingId(null); setForm(emptyForm); }}
              className="px-6 py-2 bg-card border border-border rounded-xl font-bold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border text-sm">
            <tr>
              <th className="p-4 font-medium">العبارة</th>
              <th className="p-4 font-medium">الشرح</th>
              <th className="p-4 font-medium">الحرف</th>
              <th className="p-4 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list?.data.map(entry => (
              <tr key={entry.id} className={`hover:bg-card/50 ${editingId === entry.id ? 'bg-primary/5' : ''}`}>
                <td className="p-4 font-bold text-primary max-w-xs">{entry.word}</td>
                <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{entry.meaning}</td>
                <td className="p-4 text-center"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">{(entry as any).letter || "—"}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(entry)} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => del({ id: entry.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/dictionary'] }) })}
                      className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Tafseeh Entries ─── */
function TafseehEntriesPanel() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ originalText: "", suggestions: ["", ""] });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const BASE = typeof window !== "undefined" ? (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") || "" : "";

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/tafseeh/entries`);
      if (res.ok) setEntries(await res.json().catch(() => []));
    } catch { /* API unavailable */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (entry: any) => {
    setOpen(false);
    setEditingId(entry.id);
    setForm({ originalText: entry.originalText ?? "", suggestions: entry.suggestions?.length ? entry.suggestions : ["", ""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = JSON.stringify({ originalText: form.originalText, suggestions: form.suggestions.filter(Boolean) });
      const url = editingId !== null ? `${BASE}/api/tafseeh/entries/${editingId}` : `${BASE}/api/tafseeh/entries`;
      const method = editingId !== null ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      if (res.ok) {
        toast({ title: editingId !== null ? "تم التحديث" : "تمت الإضافة" });
        setForm({ originalText: "", suggestions: ["", ""] });
        setOpen(false); setEditingId(null);
        load();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/tafseeh/entries/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  const isFormOpen = open || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">نصوص التفصيح المحفوظة ({entries.length})</h3>
        <button onClick={() => { setOpen(!open); setEditingId(null); setForm({ originalText: "", suggestions: ["", ""] }); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          <PlusCircle className="w-4 h-4" /> إضافة نص
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border-2 border-primary/20">
          <h4 className="font-bold text-primary">{editingId !== null ? "تعديل النص" : "نص جديد"}</h4>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">النص الأصلي *</label>
            <textarea value={form.originalText} onChange={e => setForm({ ...form, originalText: e.target.value })}
              rows={3} placeholder="النص الأصلي الذي يكتبه المستخدم..."
              className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm resize-none" />
          </div>
          {form.suggestions.map((s, i) => (
            <div key={i}>
              <label className="block text-xs font-bold text-muted-foreground mb-1">الاقتراح الأفصح {i + 1}</label>
              <textarea value={s} onChange={e => setForm(f => ({ ...f, suggestions: f.suggestions.map((x, j) => j === i ? e.target.value : x) }))}
                rows={3} placeholder={`الاقتراح الأفصح ${i + 1}...`}
                className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm resize-none" />
            </div>
          ))}
          <button type="button" onClick={() => setForm(f => ({ ...f, suggestions: [...f.suggestions, ""] }))}
            className="text-xs text-primary hover:underline flex items-center gap-1">
            <PlusCircle className="w-3 h-3" /> إضافة اقتراح آخر
          </button>
          <div className="flex gap-3">
            <button type="submit" disabled={saving || !form.originalText} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">
              {saving ? "جاري الحفظ..." : editingId !== null ? "تحديث" : "حفظ"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditingId(null); }} className="px-6 py-2 bg-card border border-border rounded-xl font-bold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {entries.map((entry: any) => (
          <div key={entry.id} className={`glass-panel p-5 rounded-2xl border border-border/60 ${editingId === entry.id ? 'border-primary/40' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <p className="font-bold text-sm text-muted-foreground">النص الأصلي:</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(entry)} className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(entry.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-foreground font-display mb-3 p-3 bg-muted/30 rounded-lg text-sm">{entry.originalText}</p>
            <div className="space-y-2">
              {(entry.suggestions as string[]).map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full flex-shrink-0">الاقتراح {i + 1}</span>
                  <p className="text-sm text-foreground font-display">{s}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <PenTool className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>لا توجد نصوص محفوظة بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Word Ordering ─── */
function WordOrderingPanel() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [wordsInput, setWordsInput] = useState("");
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const BASE = typeof window !== "undefined" ? (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") || "" : "";

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/word-ordering`);
      if (res.ok) setExercises(await res.json().catch(() => []));
    } catch { /* API unavailable */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setWordsInput(""); setHint(""); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const words = wordsInput.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) { toast({ title: "أدخل كلمتين على الأقل", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/word-ordering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words, hint: hint || undefined }),
      });
      if (res.ok) {
        toast({ title: "تمت الإضافة" });
        resetForm(); setOpen(false);
        load();
      }
    } finally { setSaving(false); }
  };

  const startEdit = (ex: any) => {
    setEditingId(ex.id);
    setOpen(false);
    setWordsInput((ex.words as string[]).join(" "));
    setHint(ex.hint ?? "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const words = wordsInput.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) { toast({ title: "أدخل كلمتين على الأقل", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/word-ordering/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words, hint: hint || undefined }),
      });
      if (res.ok) {
        toast({ title: "تم التحديث" });
        setEditingId(null); resetForm();
        load();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/word-ordering/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <Loading />;

  const isEditing = editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">تمارين الترتيب ({exercises.length})</h3>
        <button onClick={() => { setOpen(!open); setEditingId(null); resetForm(); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          <PlusCircle className="w-4 h-4" /> إضافة تمرين
        </button>
      </div>

      {(open || isEditing) && (
        <form onSubmit={isEditing ? handleUpdate : handleCreate} className="glass-panel p-6 rounded-2xl space-y-4 border-2 border-primary/20">
          <h4 className="font-bold text-primary">{isEditing ? "تعديل التمرين" : "تمرين جديد"}</h4>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">الكلمات بالترتيب الصحيح * (مفصولة بمسافات)</label>
            <input value={wordsInput} onChange={e => setWordsInput(e.target.value)}
              placeholder="مثال: كان الملك عادلاً حكيماً"
              className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm" />
            <p className="text-xs text-muted-foreground mt-1">ستظهر الكلمات للمستخدم بترتيب عشوائي</p>
          </div>
          <Field label="تلميح (اختياري)" value={hint} onChange={setHint} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving || !wordsInput.trim()} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">
              {saving ? "جاري الحفظ..." : isEditing ? "تحديث" : "حفظ"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditingId(null); resetForm(); }} className="px-6 py-2 bg-card border border-border rounded-xl font-bold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border text-sm">
            <tr>
              <th className="p-4 font-medium">الجملة الصحيحة</th>
              <th className="p-4 font-medium">عدد الكلمات</th>
              <th className="p-4 font-medium">تلميح</th>
              <th className="p-4 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exercises.map(ex => (
              <tr key={ex.id} className="hover:bg-card/50">
                <td className="p-4 font-display font-bold text-primary">{(ex.words as string[]).join(" ")}</td>
                <td className="p-4 text-center text-sm">{(ex.words as string[]).length}</td>
                <td className="p-4 text-sm text-muted-foreground">{ex.hint || "—"}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(ex)} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(ex.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exercises.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">لا توجد تمارين بعد</div>
        )}
      </div>
    </div>
  );
}

/* ─── Rhymes ─── */
const RHYMES_BABS = [
  "الصفات والأخلاق الحسنة","الصفات والأخلاق السيئة","الغنى والفقر",
  "الكرم والبخل","الأزمنة والأمكنة","الحروب والعداء","المشاعر والأحاسيس",
  "الأطوار والأسنان","حكم ومواعظ","الأدعية","العلاقات والمعاملات",
];

function RhymesPanel() {
  const { data: list, isLoading } = useGetRhymes({ page: 1, limit: 50 });
  const { mutate: create, isPending: isCreating } = useCreateRhyme();
  const { mutate: update, isPending: isUpdating } = useUpdateRhyme();
  const { mutate: del } = useDeleteRhyme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const emptyForm = { phrase: "", explanation: "", category: "" };
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const startEdit = (r: any) => {
    setOpen(false);
    setEditingId(r.id);
    setForm({ phrase: r.phrase ?? "", explanation: r.explanation ?? "", category: r.category ?? "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { phrase: form.phrase, explanation: form.explanation, category: form.category || undefined };
    if (editingId !== null) {
      update({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/rhymes'] });
          toast({ title: "تم التحديث بنجاح" });
          setEditingId(null); setForm(emptyForm);
        }
      });
    } else {
      create({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/rhymes'] });
          toast({ title: "تمت الإضافة" });
          setForm(emptyForm); setOpen(false);
        }
      });
    }
  };

  if (isLoading) return <Loading />;

  const isFormOpen = open || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">العبارات ({list?.total ?? 0})</h3>
        <button onClick={() => { setOpen(!open); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          <PlusCircle className="w-4 h-4" /> إضافة عبارة
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border-2 border-primary/20">
          <h4 className="font-bold text-primary">{editingId !== null ? "تعديل العبارة" : "عبارة جديدة"}</h4>
          <Field label="العبارة البديعة *" value={form.phrase} onChange={v => setForm({ ...form, phrase: v })} />
          <Field label="المقترحات *" value={form.explanation} onChange={v => setForm({ ...form, explanation: v })} textarea />
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">الباب</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full p-2 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm">
              <option value="">اختر الباب...</option>
              {RHYMES_BABS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={(editingId !== null ? isUpdating : isCreating) || !form.phrase || !form.explanation}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">
              {(editingId !== null ? isUpdating : isCreating) ? "جاري الحفظ..." : editingId !== null ? "تحديث" : "حفظ"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditingId(null); setForm(emptyForm); }}
              className="px-6 py-2 bg-card border border-border rounded-xl font-bold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border text-sm">
            <tr>
              <th className="p-4 font-medium">العبارة</th>
              <th className="p-4 font-medium">المقترحات</th>
              <th className="p-4 font-medium">الباب</th>
              <th className="p-4 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list?.data.map(r => (
              <tr key={r.id} className={`hover:bg-card/50 ${editingId === r.id ? 'bg-primary/5' : ''}`}>
                <td className="p-4 font-display font-bold text-foreground max-w-xs">{r.phrase}</td>
                <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{r.explanation}</td>
                <td className="p-4 text-xs"><span className="bg-secondary/30 px-2 py-1 rounded">{r.category || "—"}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(r)} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => del({ id: r.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/rhymes'] }) })}
                      className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Courses with Phases ─── */
type ItemLink = { text: string; link: string };
type Phase = {
  month: number; title: string;
  hafizat_quran: ItemLink[]; hafizat_hadith: ItemLink[]; hafizat_poetry: ItemLink[];
  readings: ItemLink[]; videos: ItemLink[];
};
type CourseForm = {
  title: string; description: string; instructor: string;
  level: string; duration: string; link: string; isFree: boolean; price: string;
  phases: Phase[];
};

function emptyPhase(month: number): Phase {
  return { month, title: `الشهر ${arabicMonth(month)}`, hafizat_quran: [], hafizat_hadith: [], hafizat_poetry: [], readings: [], videos: [] };
}
function arabicMonth(n: number) {
  const nums = ["","الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر"];
  return nums[n] || String(n);
}

function PhaseItemEditor({ items, onChange, label }: { items: ItemLink[]; onChange: (items: ItemLink[]) => void; label: string }) {
  const add = () => onChange([...items, { text: "", link: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof ItemLink, val: string) => onChange(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <button type="button" onClick={add} className="text-xs text-primary hover:underline flex items-center gap-1">
          <PlusCircle className="w-3 h-3" /> إضافة
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={item.text} onChange={e => update(i, "text", e.target.value)} placeholder="النص..." className="flex-1 p-2 text-xs rounded-lg bg-background border border-border outline-none focus:border-primary" />
            <input value={item.link} onChange={e => update(i, "link", e.target.value)} placeholder="رابط (اختياري)" className="flex-1 p-2 text-xs rounded-lg bg-background border border-border outline-none focus:border-primary" />
            <button type="button" onClick={() => remove(i)} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 flex-shrink-0">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhaseEditor({ phase, onChange, onDelete }: { phase: Phase; onChange: (p: Phase) => void; onDelete: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const set = (key: keyof Phase, val: any) => onChange({ ...phase, [key]: val });
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <span className="font-bold text-sm text-primary">{phase.title}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
            <Trash2 className="w-3 h-3" />
          </button>
          <span className="text-muted-foreground text-xs">{collapsed ? "▲" : "▼"}</span>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-4 bg-card/50">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">عنوان المرحلة</label>
            <input value={phase.title} onChange={e => set("title", e.target.value)} className="w-full p-2 text-sm rounded-lg bg-background border border-border outline-none focus:border-primary" />
          </div>
          <div className="bg-muted/30 rounded-xl p-3 space-y-3">
            <p className="text-xs font-bold text-foreground">المحفوظات</p>
            <PhaseItemEditor items={phase.hafizat_quran} onChange={v => set("hafizat_quran", v)} label="📖 محفوظات القرآن" />
            <PhaseItemEditor items={phase.hafizat_hadith} onChange={v => set("hafizat_hadith", v)} label="📜 محفوظات الحديث" />
            <PhaseItemEditor items={phase.hafizat_poetry} onChange={v => set("hafizat_poetry", v)} label="🪶 محفوظات الشعر" />
          </div>
          <PhaseItemEditor items={phase.readings} onChange={v => set("readings", v)} label="📚 المقروءات" />
          <PhaseItemEditor items={phase.videos} onChange={v => set("videos", v)} label="🎬 المرئيات" />
        </div>
      )}
    </div>
  );
}

function CoursesPanel() {
  const { data: list, isLoading } = useGetCourses();
  const { mutate: del } = useDeleteCourse();
  const { mutate: updateCourse } = useUpdateCourse();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm: CourseForm = { title: "", description: "", instructor: "", level: "مبتدئ", duration: "", link: "", isFree: true, price: "", phases: [] };
  const [form, setForm] = useState<CourseForm>(emptyForm);

  const BASE = typeof window !== "undefined" ? window.location.origin : "";

  const startEdit = (c: any) => {
    setOpen(false);
    setEditingId(c.id);
    setForm({
      title: c.title ?? "", description: c.description ?? "", instructor: c.instructor ?? "",
      level: c.level ?? "مبتدئ", duration: c.duration ?? "", link: c.link ?? "",
      isFree: c.isFree ?? true, price: c.price ?? "", phases: c.phases ?? [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId !== null) {
        updateCourse({ id: editingId, data: form as any }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
            toast({ title: "تم تحديث الدورة بنجاح" });
            setEditingId(null); setForm(emptyForm);
          }
        });
      } else {
        const res = await fetch(`${BASE}/api/courses`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
          toast({ title: "تمت إضافة الدورة بنجاح" });
          setForm(emptyForm); setOpen(false);
        }
      }
    } finally { setSaving(false); }
  };

  const addPhase = () => setForm(f => ({ ...f, phases: [...f.phases, emptyPhase(f.phases.length + 1)] }));
  const updatePhase = (i: number, p: Phase) => setForm(f => ({ ...f, phases: f.phases.map((ph, idx) => idx === i ? p : ph) }));
  const deletePhase = (i: number) => setForm(f => ({ ...f, phases: f.phases.filter((_, idx) => idx !== i) }));

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">الدورات ({list?.length ?? 0})</h3>
        <button onClick={() => { setOpen(!open); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          <PlusCircle className="w-4 h-4" /> {open ? "إغلاق" : "إضافة دورة"}
        </button>
      </div>

      {(open || editingId !== null) && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-5 border border-primary/20">
          <h4 className="font-display font-bold text-xl text-primary">{editingId !== null ? "تعديل الدورة" : "بناء دورة جديدة"}</h4>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="عنوان الدورة *" value={form.title} onChange={v => setForm({ ...form, title: v })} />
            <Field label="المحاضر *" value={form.instructor} onChange={v => setForm({ ...form, instructor: v })} />
            <Field label="المدة" value={form.duration} onChange={v => setForm({ ...form, duration: v })} />
            <Field label="الرابط الرئيسي *" value={form.link} onChange={v => setForm({ ...form, link: v })} />
            <div>
              <label className="block text-sm font-bold mb-1 text-muted-foreground">مستوى الدورة</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary text-sm">
                <option>مبتدئ</option>
                <option>متوسط</option>
                <option>متقدم</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} className="w-5 h-5 accent-primary" />
                <span className="font-bold text-sm">دورة مجانية</span>
              </label>
            </div>
            {!form.isFree && (
              <Field label="سعر الدورة (مثال: 99$)" value={form.price} onChange={v => setForm({ ...form, price: v })} />
            )}
          </div>
          <Field label="وصف الدورة *" value={form.description} onChange={v => setForm({ ...form, description: v })} textarea />

          {/* Phases Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-sm">مراحل الدورة ({form.phases.length} مراحل)</h5>
              <button type="button" onClick={addPhase}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-secondary/15 text-secondary rounded-lg border border-secondary/30 hover:bg-secondary/25 transition-colors">
                <PlusCircle className="w-3.5 h-3.5" /> إضافة شهر
              </button>
            </div>
            {form.phases.length === 0 && (
              <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                انقر على "إضافة شهر" لبناء مراحل الدورة
              </div>
            )}
            {form.phases.map((phase, i) => (
              <PhaseEditor key={i} phase={phase} onChange={p => updatePhase(i, p)} onDelete={() => deletePhase(i)} />
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || !form.title || !form.instructor || !form.link}
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              {saving ? "جاري الحفظ..." : editingId !== null ? "تحديث الدورة" : "حفظ الدورة"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditingId(null); setForm(emptyForm); }}
              className="px-6 py-2.5 bg-card border border-border rounded-xl font-bold hover:bg-muted/50 transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list?.map((c: any) => (
          <div key={c.id} className={`glass-panel p-5 rounded-2xl border border-border/60 ${editingId === c.id ? 'border-primary/40' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg leading-tight flex-1 ml-3">{c.title}</h4>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(c)} className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => del({ id: c.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/courses'] }) })}
                  className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{c.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-muted px-2 py-0.5 rounded border border-border">{c.instructor}</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded border border-border">{c.level}</span>
              {c.phases?.length > 0 && <span className="text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded border border-secondary/25">{c.phases.length} مراحل</span>}
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${c.isFree ? 'bg-green-500/15 text-green-600' : 'bg-yellow-500/15 text-yellow-700'}`}>
                {c.isFree ? 'مجاني' : 'مدفوع'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Quiz ─── */
function QuizPanel() {
  const { data: list, isLoading } = useGetQuizQuestions();
  const { mutate: create, isPending } = useCreateQuizQuestion();
  const { mutate: del } = useDeleteQuizQuestion();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: "", opt0: "", opt1: "", opt2: "", opt3: "", correctIndex: "0", explanation: "" });
  const BASE = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") || "";

  const resetForm = () => setForm({ question: "", opt0: "", opt1: "", opt2: "", opt3: "", correctIndex: "0", explanation: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const options = [form.opt0, form.opt1, form.opt2, form.opt3].filter(Boolean);
    if (options.length < 2) return;
    create({
      data: { question: form.question, options, correctIndex: Number(form.correctIndex), explanation: form.explanation }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/quiz/questions'] });
        toast({ title: "تمت إضافة السؤال" });
        resetForm();
        setOpen(false);
      }
    });
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setOpen(false);
    const opts = q.options as string[];
    setForm({
      question: q.question,
      opt0: opts[0] ?? "",
      opt1: opts[1] ?? "",
      opt2: opts[2] ?? "",
      opt3: opts[3] ?? "",
      correctIndex: String(q.correctIndex),
      explanation: q.explanation ?? "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const options = [form.opt0, form.opt1, form.opt2, form.opt3].filter(Boolean);
    setSaving(true);
    try {
      await fetch(`${BASE}/api/quiz/questions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: form.question, options, correctIndex: Number(form.correctIndex), explanation: form.explanation }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quiz/questions'] });
      toast({ title: "تم تحديث السؤال" });
      setEditingId(null);
      resetForm();
    } finally { setSaving(false); }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">الأسئلة ({list?.length ?? 0})</h3>
        <button onClick={() => { setOpen(!open); setEditingId(null); resetForm(); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
          <PlusCircle className="w-4 h-4" /> إضافة سؤال
        </button>
      </div>

      {(open || editingId !== null) && (
        <form onSubmit={editingId !== null ? handleUpdate : handleCreate} className="glass-panel p-6 rounded-2xl space-y-4 border-2 border-primary/20">
          <h4 className="font-bold text-primary">{editingId !== null ? "تعديل السؤال" : "سؤال جديد"}</h4>
          <Field label="السؤال *" value={form.question} onChange={v => setForm({ ...form, question: v })} textarea />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الخيار الأول *" value={form.opt0} onChange={v => setForm({ ...form, opt0: v })} />
            <Field label="الخيار الثاني *" value={form.opt1} onChange={v => setForm({ ...form, opt1: v })} />
            <Field label="الخيار الثالث" value={form.opt2} onChange={v => setForm({ ...form, opt2: v })} />
            <Field label="الخيار الرابع" value={form.opt3} onChange={v => setForm({ ...form, opt3: v })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-muted-foreground">الإجابة الصحيحة</label>
            <select value={form.correctIndex} onChange={e => setForm({ ...form, correctIndex: e.target.value })}
              className="w-full p-3 rounded-xl bg-card border border-border outline-none focus:border-primary">
              <option value="0">الخيار الأول</option>
              <option value="1">الخيار الثاني</option>
              <option value="2">الخيار الثالث</option>
              <option value="3">الخيار الرابع</option>
            </select>
          </div>
          <Field label="شرح الإجابة *" value={form.explanation} onChange={v => setForm({ ...form, explanation: v })} textarea />
          <div className="flex gap-3">
            <button type="submit" disabled={(editingId !== null ? saving : isPending) || !form.question || !form.opt0 || !form.opt1}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">
              {(editingId !== null ? saving : isPending) ? "جاري الحفظ..." : editingId !== null ? "تحديث" : "حفظ"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setEditingId(null); resetForm(); }} className="px-6 py-2 bg-card border border-border rounded-xl font-bold">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {list?.map((q, i) => (
          <div key={q.id} className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-bold mb-3">{i + 1}. {q.question}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, idx) => (
                    <span key={idx} className={`text-sm px-3 py-1.5 rounded-lg border ${idx === q.correctIndex ? 'border-green-500 bg-green-500/10 text-green-500 font-bold' : 'border-border text-muted-foreground'}`}>
                      {idx === q.correctIndex ? '✓ ' : ''}{opt}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{q.explanation}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(q)}
                  className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => del({ id: q.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/quiz/questions'] }) })}
                  className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Spelling Texts ─── */
function SpellingPanel() {
  const { mutate: create, isPending } = useCreateSpellingText();
  const { toast } = useToast();
  const [form, setForm] = useState({ text: "", category: "", audioUrl: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create({ data: { text: form.text, category: form.category || undefined, audioUrl: form.audioUrl || undefined } as any }, {
      onSuccess: () => {
        toast({ title: "تمت إضافة النص" });
        setForm({ text: "", category: "", audioUrl: "" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">إضافة نص جديد للقراءة والإملاء</h3>
      <form onSubmit={handleCreate} className="glass-panel p-6 rounded-2xl space-y-4">
        <Field label="النص الإملائي *" value={form.text} onChange={v => setForm({ ...form, text: v })} textarea />
        <Field label="التصنيف (مثال: قرآن كريم، نثر أدبي...)" value={form.category} onChange={v => setForm({ ...form, category: v })} />
        <Field label="رابط الصوت (للاستماع في مصحح القراءة)" value={form.audioUrl} onChange={v => setForm({ ...form, audioUrl: v })} />
        <p className="text-xs text-muted-foreground">أدخل رابط ملف صوتي (MP3/OGG) لدعم ميزة الاستماع في تبويب مصحح القراءة</p>
        <button type="submit" disabled={isPending || !form.text} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50">
          {isPending ? "جاري الحفظ..." : "حفظ النص"}
        </button>
      </form>
      <div className="glass-panel p-5 rounded-2xl text-muted-foreground text-sm text-center">
        النصوص تُعرض عشوائياً في صفحة مصحح الإملاء والقراءة.
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function Loading() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    approved: { label: 'معتمد', className: 'bg-green-500/20 text-green-500' },
    pending: { label: 'قيد المراجعة', className: 'bg-yellow-500/20 text-yellow-500' },
    suspended: { label: 'موقوف', className: 'bg-red-500/20 text-red-500' },
  };
  const s = map[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return <span className={`px-2 py-1 rounded text-xs font-bold ${s.className}`}>{s.label}</span>;
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm";
  return (
    <div>
      <label className="block text-sm font-bold mb-1 text-muted-foreground">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} className={`${cls} resize-none h-24`} dir="rtl" />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} dir="rtl" />
      }
    </div>
  );
}
