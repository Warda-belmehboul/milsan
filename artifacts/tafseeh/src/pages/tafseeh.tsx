import { useState } from "react";
import { Layout } from "@/components/layout";
import { PenTool, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { useAutoTafseeh } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tafseeh() {
  const [text, setText] = useState("");
  const { mutate, data, isPending, error } = useAutoTafseeh();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    mutate({ data: { text } });
  };

  const copy = (str: string, i: number) => {
    navigator.clipboard.writeText(str);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">فصح نصك آليا</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Pane */}
          <div className="flex flex-col h-full">
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-[500px]">
              <div className="glass-panel p-2 rounded-t-2xl border-b-0 bg-secondary/20 flex justify-between items-center">
                <span className="px-4 font-bold text-primary text-sm">النص الأصلي</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب أو انسخ النص هنا..."
                className="w-full flex-1 p-6 bg-card border-2 border-border focus:border-primary focus:ring-0 outline-none resize-none text-lg leading-loose rounded-b-2xl shadow-inner placeholder:text-muted-foreground/50"
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !text.trim()}
                  className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all flex items-center gap-2"
                >
                  {isPending ? (
                    <>جاري التفصيح <Sparkles className="w-5 h-5 animate-pulse" /></>
                  ) : (
                    <>فصّح النص <PenTool className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Output Pane */}
          <div className="flex flex-col h-full min-h-[500px] glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />

            <h3 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="text-primary w-6 h-6" />
              المقترحات الفصيحة
            </h3>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>حدث خطأ أثناء معالجة النص. حاول مرة أخرى.</p>
              </div>
            )}

            {!data && !isPending && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <PenTool className="w-16 h-16 mb-4" />
                <p>النتائج ستظهر هنا</p>
              </div>
            )}

            {isPending && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-primary font-display animate-pulse">يستلهم البيان...</p>
              </div>
            )}

            <AnimatePresence>
              {data?.suggestions && (
                <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                  {data.suggestions.map((sug: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group relative"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                          الاقتراح الأفصح {i + 1}
                        </span>
                        <button
                          onClick={() => copy(typeof sug === "string" ? sug : sug.text, i)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="نسخ"
                        >
                          {copiedIdx === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-lg font-display leading-relaxed text-foreground">
                        {typeof sug === "string" ? sug : sug.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
