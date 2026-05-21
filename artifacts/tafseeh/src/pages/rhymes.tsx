import { useState } from "react";
import { Layout } from "@/components/layout";
import { Feather, Search, Tag, Loader2 } from "lucide-react";
import { useGetRhymes } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion } from "framer-motion";

const BABS = [
  "الصفات والأخلاق الحسنة",
  "الصفات والأخلاق السيئة",
  "الغنى والفقر",
  "الكرم والبخل",
  "الأزمنة والأمكنة",
  "الحروب والعداء",
  "المشاعر والأحاسيس",
  "الأطوار والأسنان",
  "حكم ومواعظ",
  "الأدعية",
  "العلاقات والمعاملات",
];

export default function Rhymes() {
  const [search, setSearch] = useState("");
  const [activeBab, setActiveBab] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetRhymes({
    page,
    limit: 12,
    q: debouncedSearch || undefined,
    bab: activeBab || undefined,
  } as any);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const handleBab = (bab: string) => {
    setSearch("");
    setActiveBab(prev => prev === bab ? null : bab);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setActiveBab(null);
    setPage(1);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Feather className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">فنون البديع والبيان</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-3">
            معجم العبارات البديعة
          </h1>
          <div className="section-divider" />
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary/70" />
          </div>
          <input
            type="text"
            className="w-full py-4 pr-14 pl-5 rounded-2xl bg-card border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/15 text-lg outline-none shadow-lg transition-all"
            placeholder="ابحث عن العبارات البديعة..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Bab Filter */}
        <div className="glass-panel rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-muted-foreground">تصفح بالباب</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BABS.map((bab) => (
              <button
                key={bab}
                onClick={() => handleBab(bab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeBab === bab
                    ? "bg-secondary text-secondary-foreground border-secondary/50 shadow-md"
                    : "bg-card/70 hover:bg-secondary/10 text-foreground border-border/50"
                }`}
              >
                {bab}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter */}
        {activeBab && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-sm text-muted-foreground">تصفية:</span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full border border-secondary/20 font-bold">
              {activeBab}
            </span>
            <button
              onClick={() => { setActiveBab(null); setSearch(""); }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              ✕ إزالة
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {/* Entries */}
        {!isLoading && data && data.data.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-5">
              {data.data.map((rhyme: any, i: number) => (
                <motion.div
                  key={rhyme.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel p-6 rounded-2xl border border-border/60 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <h3 className="text-xl font-display font-bold text-primary leading-relaxed">{rhyme.phrase}</h3>
                    {rhyme.category && (
                      <span className="flex-shrink-0 text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-3 py-1 whitespace-nowrap">
                        {rhyme.category}
                      </span>
                    )}
                  </div>
                  {rhyme.explanation && (
                    <div className="mt-1">
                      <p className="text-xs font-bold text-muted-foreground mb-1">المقترحات:</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{rhyme.explanation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2 rounded-xl glass-panel font-bold text-sm disabled:opacity-40 hover:bg-card/80 transition-all"
                >
                  السابق
                </button>
                <span className="px-5 py-2 text-sm text-muted-foreground font-bold">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2 rounded-xl glass-panel font-bold text-sm disabled:opacity-40 hover:bg-card/80 transition-all"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Feather className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد نتائج</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
