import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Gamepad2, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetQuizQuestions } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "quiz" | "ordering";

export default function Quiz() {
  const [activeTab, setActiveTab] = useState<Tab>("quiz");

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-3">الألعاب اللغوية</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 justify-center">
          {([
            { id: "quiz", label: "لعبة الإختيارات", icon: Trophy },
            { id: "ordering", label: "لعبة الترتيب", icon: Shuffle },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
                activeTab === t.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "glass-panel text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <QuizGame />
            </motion.div>
          )}
          {activeTab === "ordering" && (
            <motion.div key="ordering" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <WordOrderingGame />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizGame() {
  const { data: allQuestions, isLoading } = useGetQuizQuestions();
  const [shuffledList, setShuffledList] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { correct: boolean; explanation: string; correctIdx: number; selectedIdx: number }>>({});
  const [isPending, setIsPending] = useState(false);
  const [score, setScore] = useState(0);
  const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (allQuestions && allQuestions.length > 0 && shuffledList.length === 0) {
      setShuffledList(shuffle(allQuestions));
    }
  }, [allQuestions]);

  const question = shuffledList[currentIdx];
  const answer = question ? answers[question.id] : null;

  const handleSelect = async (idx: number) => {
    if (answer || isPending || !question) return;
    setIsPending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/quiz/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, selectedIndex: idx }),
      });
      const data = await res.json();
      const isCorrect = data.correct;
      setAnswers((prev) => ({
        ...prev,
        [question.id]: {
          correct: isCorrect,
          explanation: data.explanation,
          correctIdx: data.correctIndex,
          selectedIdx: idx,
        },
      }));
      if (isCorrect) setScore((s) => s + 1);
    } finally {
      setIsPending(false);
    }
  };

  const goNext = () => {
    if (currentIdx < shuffledList.length - 1) setCurrentIdx((i) => i + 1);
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  if (isLoading || (allQuestions && allQuestions.length > 0 && shuffledList.length === 0)) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl">
        <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">لا توجد أسئلة بعد. يمكن للمدير إضافة أسئلة من لوحة الإدارة.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-muted-foreground">النقاط: {score}</span>
        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
          لعبة الإختيارات
        </span>
        <span className="text-sm text-muted-foreground">
          {currentIdx + 1} / {shuffledList.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-8 leading-relaxed">
            {question?.question}
          </h2>

          <div className="space-y-3 mb-8">
            {((question?.options ?? []) as string[]).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={!!answer || isPending}
                className={cn(
                  "w-full text-right p-4 rounded-xl border-2 transition-all font-display text-lg",
                  !answer && answer === null
                    ? "border-border hover:border-primary/50 hover:bg-card/80 cursor-pointer"
                    : answer?.correctIdx === idx
                    ? "border-green-500 bg-green-500/10 text-green-700"
                    : answer?.selectedIdx === idx && !answer?.correct
                    ? "border-red-500 bg-red-500/10 text-red-700"
                    : "border-border opacity-60 cursor-default"
                )}
              >
                <div className="flex items-center gap-3">
                  {answer && (
                    answer?.correctIdx === idx
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      : answer?.selectedIdx === idx
                      ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      : <span className="w-5" />
                  )}
                  {opt}
                </div>
              </button>
            ))}
          </div>

          {answer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className={cn("p-4 rounded-xl mb-6 border", answer.correct ? "bg-green-500/10 border-green-500/30 text-green-700" : "bg-red-500/10 border-red-500/30 text-red-700")}>
                <p className="font-bold mb-1">{answer.correct ? "إجابة صحيحة!" : "إجابة خاطئة"}</p>
                <p className="text-sm opacity-90">{answer.explanation}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="px-5 py-2.5 rounded-xl font-bold bg-card border border-border hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" /> السابق
        </button>
        {currentIdx < shuffledList.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!answer}
            className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-40"
          >
            التالي <ChevronLeft className="w-4 h-4" />
          </button>
        ) : answer ? (
          <div className="px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 font-bold text-sm text-center">
            انتهت الأسئلة! النقاط: {score} / {shuffledList.length}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WordOrderingGame() {
  const [exercise, setExercise] = useState<any>(null);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [loading, setLoading] = useState(true);
  const [noExercises, setNoExercises] = useState(false);

  const loadExercise = async () => {
    setResult(null);
    setUserOrder([]);
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${BASE_URL}/api/word-ordering/random`);
      const data = await res.json();
      if (!data || !data.id) { setNoExercises(true); setLoading(false); return; }
      setNoExercises(false);
      setExercise(data);
      setShuffled(shuffle(data.words as string[]));
    } catch {
      setNoExercises(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExercise(); }, []);

  const addWord = (word: string) => {
    if (result) return;
    setUserOrder((prev) => [...prev, word]);
  };

  const removeWord = (idx: number) => {
    if (result) return;
    setUserOrder((prev) => prev.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    if (!exercise) return;
    const correct = (exercise.words as string[]).join(" ") === userOrder.join(" ");
    setResult(correct ? "correct" : "wrong");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (noExercises) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl">
        <Shuffle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">لا توجد تمارين ترتيب بعد. يمكن للمدير إضافتها من لوحة الإدارة.</p>
      </div>
    );
  }

  const remaining = shuffled.filter((w, i) => {
    const usedCount = userOrder.filter((u) => u === w).length;
    const totalCount = shuffled.slice(0, i + 1).filter((s) => s === w).length + shuffled.slice(i + 1).filter((s) => s === w).length;
    return usedCount < 1 || shuffled.slice(0, i).filter((s) => s === w).length < usedCount;
  });

  const getUsedCount = (word: string) => userOrder.filter((u) => u === word).length;
  const getShuffledCount = (word: string) => shuffled.filter((s) => s === word).length;

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-bold border border-secondary/20">
          لعبة الترتيب
        </span>
        {exercise?.hint && (
          <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            تلميح: {exercise.hint}
          </span>
        )}
      </div>

      <p className="text-center text-muted-foreground mb-6 font-bold">رتب الكلمات حسب مرتبتها وشدتها</p>

      {/* User's answer area */}
      <div className="min-h-20 border-2 border-dashed border-primary/30 rounded-2xl p-4 mb-6 bg-primary/5 flex flex-wrap gap-2 items-center">
        {userOrder.length === 0 && (
          <p className="text-muted-foreground/60 text-sm mx-auto">انقر على الكلمات أدناه لترتيبها هنا</p>
        )}
        <AnimatePresence>
          {userOrder.map((word, i) => (
            <motion.button
              key={`placed-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => removeWord(i)}
              disabled={!!result}
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-lg border-2 transition-all",
                result === "correct"
                  ? "bg-green-500/20 border-green-500/50 text-green-700"
                  : result === "wrong"
                  ? "bg-red-500/20 border-red-500/50 text-red-700"
                  : "bg-primary/15 border-primary/30 text-primary hover:bg-destructive/15 hover:border-destructive/30 hover:text-destructive"
              )}
            >
              {word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center min-h-16">
        {shuffled.map((word, i) => {
          const isUsed = getUsedCount(word) >= getShuffledCount(word);
          return (
            <button
              key={`avail-${i}`}
              onClick={() => !isUsed && addWord(word)}
              disabled={isUsed || !!result}
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-lg border-2 transition-all",
                isUsed
                  ? "opacity-30 border-border bg-muted cursor-default"
                  : "border-border bg-card hover:border-secondary/50 hover:bg-secondary/10 cursor-pointer"
              )}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Result message */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl mb-6 border text-center",
              result === "correct"
                ? "bg-green-500/10 border-green-500/30 text-green-700"
                : "bg-red-500/10 border-red-500/30 text-red-700"
            )}
          >
            {result === "correct" ? (
              <><CheckCircle2 className="w-6 h-6 inline ml-2" />أحسنت! الترتيب صحيح تماماً</>
            ) : (
              <>
                <XCircle className="w-6 h-6 inline ml-2" />الترتيب الصحيح هو:
                <p className="mt-2 text-foreground font-display text-xl">{(exercise.words as string[]).join(" ")}</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between gap-4">
        <button
          onClick={loadExercise}
          className="px-6 py-3 rounded-xl font-bold bg-card border border-border hover:bg-muted transition-colors flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" /> تمرين جديد
        </button>
        {!result ? (
          <button
            onClick={checkAnswer}
            disabled={userOrder.length !== shuffled.length}
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-secondary to-primary text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> تحقق من الإجابة
          </button>
        ) : (
          <button
            onClick={loadExercise}
            className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg transition-all flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> التالي
          </button>
        )}
      </div>
    </div>
  );
}
