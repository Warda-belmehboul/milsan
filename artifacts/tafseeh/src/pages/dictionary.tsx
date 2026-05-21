import { useState } from "react";
import { Layout } from "@/components/layout";
import { Search, Loader2, BookOpen, Grid3X3 } from "lucide-react";
import { useGetDictionaryEntries, useDictionarySearch } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion } from "framer-motion";

const ARABIC_LETTERS = [
  "أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض",
  "ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي"
];

export default function Dictionary() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  const isSearching = debouncedSearch.length > 0 || activeLetter !== null;
  const queryStr = activeLetter ? activeLetter : debouncedSearch;

  const { data: searchData, isLoading: isSearchLoading } = useDictionarySearch(
    { q: queryStr },
    { query: { enabled: isSearching } }
  );

  const { data: listData, isLoading: isListLoading } = useGetDictionaryEntries(
    { page, limit: 12 },
    { query: { enabled: !isSearching } }
  );

  const isLoading = isSearching ? isSearchLoading : isListLoading;
  const entries: any[] = isSearching ? (searchData ?? []) : (listData?.data ?? []);
  const totalPages = listData ? Math.ceil(listData.total / listData.limit) : 1;

  const handleLetter = (letter: string) => {
    setSearch("");
    setActiveLetter(prev => prev === letter ? null : letter);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setActiveLetter(null);
    setPage(1);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-3">
            معجم الأساليب الفصيحة
          </h1>
          <div className="section-divider" />
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary/70" />
          </div>
          <input
            type="text"
            className="w-full py-4 pr-14 pl-6 rounded-2xl bg-card border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-lg shadow-lg"
            placeholder="ابحث عن عبارة..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Alphabetical Index */}
        <div className="glass-panel rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-muted-foreground">تصفح بالحرف</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ARABIC_LETTERS.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetter(letter)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  activeLetter === letter
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card/70 hover:bg-primary/10 text-foreground border border-border/50"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {activeLetter && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-sm text-muted-foreground">تصفية:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 font-bold">
              حرف {activeLetter}
            </span>
            <button
              onClick={() => { setActiveLetter(null); setSearch(""); }}
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

        {/* Entries Grid */}
        {!isLoading && entries && entries.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {entries.map((entry: any, i: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-panel p-5 rounded-2xl border border-border/60 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="text-xl font-display font-bold text-primary leading-relaxed">{entry.word}</h3>
                  {entry.letter && (
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {entry.letter}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{entry.meaning}</p>
                {entry.phrases && entry.phrases.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                    {entry.phrases.slice(0, 2).map((ph: string, pi: number) => (
                      <p key={pi} className="text-xs text-foreground/80 font-display italic">• {ph}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">لا توجد نتائج</p>
          </div>
        )}

        {/* Pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 rounded-xl glass-panel font-bold text-sm disabled:opacity-40"
            >
              السابق
            </button>
            <span className="px-5 py-2 text-sm text-muted-foreground font-bold">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-5 py-2 rounded-xl glass-panel font-bold text-sm disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
