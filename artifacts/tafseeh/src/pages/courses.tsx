import { useState } from "react";
import { Layout } from "@/components/layout";
import { GraduationCap, ExternalLink, BookOpen, Video, ChevronDown, ChevronUp, Star, Youtube, Instagram } from "lucide-react";
import { useGetCourses } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

type ItemLink = { text: string; link?: string };
type Phase = {
  month: number;
  title: string;
  hafizat_quran?: ItemLink[];
  hafizat_hadith?: ItemLink[];
  hafizat_poetry?: ItemLink[];
  readings?: ItemLink[];
  videos?: ItemLink[];
};

function getLinkIcon(url?: string) {
  if (!url) return null;
  if (url.includes("youtube")) return <Youtube className="w-3.5 h-3.5" />;
  if (url.includes("instagram")) return <Instagram className="w-3.5 h-3.5" />;
  return <ExternalLink className="w-3.5 h-3.5" />;
}

function ItemRow({ item }: { item: ItemLink }) {
  return (
    <li className="flex items-start justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-foreground leading-relaxed flex-1">{item.text}</span>
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary hover:text-white transition-all border border-primary/20">
          {getLinkIcon(item.link)}
          رابط
        </a>
      )}
    </li>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-border/60">
      {/* Phase Header */}
      <div className="bg-gradient-to-l from-primary/15 to-secondary/10 px-6 py-4 border-b border-border/60">
        <h3 className="text-xl font-display font-bold text-primary">{phase.title}</h3>
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-5">
        {/* محفوظات section */}
        <div className="md:col-span-2">
          <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
            <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              المحفوظات
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {/* قرآن */}
              <div>
                <p className="text-xs font-bold text-primary/80 mb-2 flex items-center gap-1">
                  <span className="text-sm">📖</span> محفوظات القرآن
                </p>
                {phase.hafizat_quran && phase.hafizat_quran.length > 0 ? (
                  <ul>{phase.hafizat_quran.map((item, i) => <ItemRow key={i} item={item} />)}</ul>
                ) : <p className="text-xs text-muted-foreground italic">لم يُضف بعد</p>}
              </div>
              {/* حديث */}
              <div>
                <p className="text-xs font-bold text-secondary/80 mb-2 flex items-center gap-1">
                  <span className="text-sm">📜</span> محفوظات الحديث
                </p>
                {phase.hafizat_hadith && phase.hafizat_hadith.length > 0 ? (
                  <ul>{phase.hafizat_hadith.map((item, i) => <ItemRow key={i} item={item} />)}</ul>
                ) : <p className="text-xs text-muted-foreground italic">لم يُضف بعد</p>}
              </div>
              {/* شعر */}
              <div>
                <p className="text-xs font-bold text-accent/80 mb-2 flex items-center gap-1">
                  <span className="text-sm">🪶</span> محفوظات الشعر
                </p>
                {phase.hafizat_poetry && phase.hafizat_poetry.length > 0 ? (
                  <ul>{phase.hafizat_poetry.map((item, i) => <ItemRow key={i} item={item} />)}</ul>
                ) : <p className="text-xs text-muted-foreground italic">لم يُضف بعد</p>}
              </div>
            </div>
          </div>
        </div>

        {/* مقروءات */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> المقروءات
          </h4>
          {phase.readings && phase.readings.length > 0 ? (
            <ul>{phase.readings.map((item, i) => <ItemRow key={i} item={item} />)}</ul>
          ) : <p className="text-xs text-muted-foreground italic">لم يُضف بعد</p>}
        </div>

        {/* مرئيات */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Video className="w-4 h-4 text-secondary" /> المرئيات
          </h4>
          {phase.videos && phase.videos.length > 0 ? (
            <ul>{phase.videos.map((item, i) => <ItemRow key={i} item={item} />)}</ul>
          ) : <p className="text-xs text-muted-foreground italic">لم يُضف بعد</p>}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const [expanded, setExpanded] = useState(false);
  const phases: Phase[] = course.phases || [];
  const [activePhase, setActivePhase] = useState(0);

  const levelColors: Record<string, string> = {
    "مبتدئ": "bg-green-500/15 text-green-600 border-green-500/30",
    "متوسط": "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
    "متقدم": "bg-red-500/15 text-red-600 border-red-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong rounded-2xl overflow-hidden border border-border/60 hover-lift"
    >
      {/* Course Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${levelColors[course.level] || "badge-primary"}`}>
            <Star className="w-3 h-3 inline ml-1" />
            {course.level}
          </span>
          {course.isFree ? (
            <span className="badge-accent">مجانية</span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-secondary/15 text-secondary border-secondary/30">
              {course.price ? course.price : "مدفوعة"}
            </span>
          )}
          {phases.length > 0 && (
            <span className="badge-secondary">{phases.length} مرحلة</span>
          )}
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-1">{course.title}</h3>
        {course.isFree && (
          <>
            <p className="text-sm font-bold text-primary mb-3">تقديم: {course.instructor}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{course.description}</p>
          </>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          {course.isFree && course.link && (
            <a href={course.link} target="_blank" rel="noopener noreferrer"
              className="btn-primary text-sm px-5 py-2 rounded-xl flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              سجل في الدورة
            </a>
          )}
          {phases.length > 0 && (
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary/10 transition-all">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? "إخفاء المراحل" : "عرض المراحل"}
            </button>
          )}
        </div>
      </div>

      {/* Phases Section */}
      <AnimatePresence>
        {expanded && phases.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Phase Tabs */}
            <div className="flex overflow-x-auto gap-2 p-4 bg-muted/30 border-b border-border/50 custom-scrollbar">
              {phases.map((phase, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhase(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    activePhase === i
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border border-border hover:bg-primary/10 hover:text-primary text-muted-foreground"
                  }`}
                >
                  {phase.title}
                </button>
              ))}
            </div>
            {/* Active Phase Content */}
            <div className="p-5">
              <PhaseCard phase={phases[activePhase]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Courses() {
  const { data: courses, isLoading } = useGetCourses();
  const [filter, setFilter] = useState<string>("الكل");

  const levels = ["الكل", "مبتدئ", "متوسط", "متقدم"];
  const filtered = courses?.filter(c =>
    filter === "الكل" || c.level === filter
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">تعلّم بمنهج محكم</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-3">الدورات التدريبية</h1>
          <p className="text-muted-foreground text-lg">برامج تعليمية متخصصة بمراحل شهرية محكمة للارتقاء بمستواك</p>
          <div className="section-divider" />
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {levels.map(level => (
            <button key={level} onClick={() => setFilter(level)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === level ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border hover:bg-primary/10 hover:text-primary text-muted-foreground"
              }`}>
              {level}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">جارٍ تحميل الدورات...</p>
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="space-y-6">
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel rounded-2xl border border-border/60">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-2xl font-display text-muted-foreground mb-2">لا توجد دورات حالياً</h3>
            <p className="text-muted-foreground/70 text-sm">ترقّب إطلاق الدورات قريباً</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
