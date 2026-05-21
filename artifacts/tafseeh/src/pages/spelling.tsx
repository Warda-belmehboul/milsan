import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Mic, Play, Square, RefreshCw, Send, ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff, BookOpen, Volume2 } from "lucide-react";
import { useGetSpellingText, useCheckSpelling } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "spelling" | "reading";

export default function Spelling() {
  const [activeTab, setActiveTab] = useState<Tab>("spelling");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto mb-6">
            <Mic className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">
            مصحح القراءة والإملاء
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 justify-center">
          {([
            { id: "spelling", label: "مصحح الإملاء", icon: Mic },
            { id: "reading", label: "مصحح القراءة", icon: BookOpen },
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
          {activeTab === "spelling" && (
            <motion.div key="spelling" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SpellingChecker />
            </motion.div>
          )}
          {activeTab === "reading" && (
            <motion.div key="reading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ReadingChecker />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function SpellingChecker() {
  const queryClient = useQueryClient();
  const { data: textData, isLoading, isFetching } = useGetSpellingText();
  const { mutate: checkSpelling, isPending, data: result, reset } = useCheckSpelling();

  const [userInput, setUserInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [textRevealed, setTextRevealed] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) setAudioSupported(false);
  }, []);

  const stopAudio = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
  };

  const speakText = (text: string) => {
    const doSpeak = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
      const estimatedMs = Math.max(3000, text.length * 120);
      playTimerRef.current = setTimeout(() => setIsPlaying(false), estimatedMs);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) doSpeak();
    else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      setTimeout(doSpeak, 300);
    }
  };

  const playAudio = () => {
    if (!textData) return;
    if (isPlaying) { stopAudio(); return; }

    // If admin uploaded audio file, use it
    if ((textData as any).audioUrl) {
      const audio = new Audio((textData as any).audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        if (audioSupported) speakText(textData.text);
      };
      setIsPlaying(true);
      audio.play();
      return;
    }

    if (!audioSupported) { setTextRevealed(true); return; }
    speakText(textData.text);
  };

  const handleSubmit = () => {
    if (!textData || !userInput.trim()) return;
    stopAudio();
    checkSpelling({ data: { original: textData.text, userInput } });
  };

  const nextExercise = () => {
    stopAudio();
    setUserInput("");
    setTextRevealed(false);
    reset();
    queryClient.invalidateQueries({ queryKey: [`/api/spelling/text`] });
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel p-6 md:p-8 rounded-3xl">
        <p className="text-center text-muted-foreground mb-6 font-bold">استمع للنص بعناية واكتب ما تسمع</p>

        {/* Audio Player */}
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-2xl mb-8 bg-card/50 gap-4">
          <button
            onClick={playAudio}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl",
              isPlaying
                ? "bg-secondary text-secondary-foreground shadow-secondary/30 animate-pulse"
                : "bg-primary text-primary-foreground shadow-primary/30 hover:scale-105"
            )}
          >
            {isPlaying ? (
              <Square className="w-10 h-10" fill="currentColor" />
            ) : (
              <Play className="w-12 h-12 mr-[-4px]" fill="currentColor" />
            )}
          </button>
          <p className="text-muted-foreground font-medium text-sm">
            {isPlaying ? "جاري القراءة... انقر للإيقاف" : "انقر للاستماع للنص"}
          </p>
          {textRevealed && textData && (
            <div className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-center font-display text-lg text-foreground leading-relaxed">
              {textData.text}
            </div>
          )}
        </div>

        <label className="block text-sm font-bold text-muted-foreground mb-2">اكتب ما سمعته:</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="اكتب النص الذي سمعته هنا..."
          dir="rtl"
          className="w-full h-48 p-6 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl resize-none text-lg outline-none mb-6 font-display leading-loose"
        />

        <div className="flex justify-between gap-4">
          <button
            onClick={nextExercise}
            className="px-6 py-3 rounded-xl font-bold bg-card border border-border hover:bg-muted transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> نص جديد
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isPending}
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-primary to-yellow-600 text-primary-foreground shadow-lg hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isPending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري التدقيق...</>
            ) : (
              <><Send className="w-4 h-4 rotate-180" /> دقق الإملاء</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-10 rounded-3xl">
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" className="stroke-border" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              className={cn("transition-all duration-1000", result.score > 80 ? "stroke-green-500" : result.score > 50 ? "stroke-yellow-500" : "stroke-red-500")}
              strokeWidth="8"
              strokeDasharray={`${result.score * 2.64} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-display font-bold">{result.score}%</span>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 text-2xl font-bold mb-2", result.score === 100 ? "text-green-500" : result.score >= 60 ? "text-yellow-500" : "text-red-500")}>
          {result.score === 100 ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          النتيجة النهائية
        </div>
        <p className="text-muted-foreground text-center max-w-lg">{result.feedback}</p>
      </div>

      {result.errors.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xl font-bold text-destructive mb-4">الأخطاء الإملائية ({result.errors.length}):</h4>
          <div className="space-y-3">
            {result.errors.map((err: any, i: number) => (
              <div key={i} className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 min-w-fit">
                  <span className="line-through text-red-400 font-bold text-lg">{err.got || "—"}</span>
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-green-500 font-bold text-lg">{err.expected}</span>
                </div>
                <div className="text-sm text-foreground/80 bg-background/50 px-3 py-2 rounded-lg flex-1">
                  <strong className="text-primary ml-1">القاعدة: </strong>
                  {err.rule}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> النص الأصلي الصحيح:
        </h4>
        <p className="text-foreground leading-relaxed text-lg font-display">{textData?.text}</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => { reset(); }}
          className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <RefreshCw className="w-5 h-5" /> تمرين جديد
        </button>
      </div>
    </motion.div>
  );
}

function ReadingChecker() {
  const queryClient = useQueryClient();
  const { data: textData, isLoading } = useGetSpellingText();

  const [isRecording, setIsRecording] = useState(false);
  const [recognized, setRecognized] = useState("");
  const [result, setResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<any>(null);

  const supportsRecognition = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = () => {
    setError("");
    setRecognized("");
    setResult(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("المتصفح لا يدعم التعرف على الصوت"); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setRecognized(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setError("حدث خطأ في التعرف على الصوت. تأكد من السماح بالوصول للمايكروفون.");
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const checkReading = async () => {
    if (!textData || !recognized.trim()) return;
    setChecking(true);
    setError("");
    try {
      const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${BASE_URL}/api/spelling/check-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original: textData.text, recognized }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setChecking(false);
    }
  };

  const nextText = () => {
    setResult(null);
    setRecognized("");
    setError("");
    queryClient.invalidateQueries({ queryKey: [`/api/spelling/text`] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl">

      {/* Text to read */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 mb-8 text-center">
        <h3 className="text-sm font-bold text-primary mb-3 flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" /> النص المطلوب قراءته
        </h3>
        <p className="text-2xl font-display leading-relaxed text-foreground">
          {textData?.text}
        </p>
      </div>

      {!supportsRecognition && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 text-sm mb-6">
          المتصفح الحالي لا يدعم التعرف على الصوت. يُنصح باستخدام Google Chrome.
        </div>
      )}

      {/* Recording Controls */}
      {!result && (
        <div className="flex flex-col items-center gap-6 mb-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!supportsRecognition}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl disabled:opacity-50",
              isRecording
                ? "bg-red-500 text-white shadow-red-500/30 animate-pulse"
                : "bg-secondary text-secondary-foreground shadow-secondary/30 hover:scale-105"
            )}
          >
            {isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : <Mic className="w-10 h-10" />}
          </button>
          <p className="text-sm text-muted-foreground font-medium">
            {isRecording ? "جاري التسجيل... انقر للإيقاف" : "انقر للبدء بالقراءة"}
          </p>

          {recognized && (
            <div className="w-full bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-bold text-muted-foreground mb-2">ما تم التعرف عليه:</p>
              <p className="text-foreground leading-relaxed font-display">{recognized}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm w-full text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={nextText}
              className="px-6 py-3 rounded-xl font-bold bg-card border border-border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> نص جديد
            </button>
            <button
              onClick={checkReading}
              disabled={!recognized.trim() || checking}
              className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-secondary to-primary text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {checking ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري التحقق...</>
              ) : (
                <><Volume2 className="w-4 h-4" /> تحقق من القراءة</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-border" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    className={cn("transition-all duration-1000", result.score > 80 ? "stroke-green-500" : result.score > 50 ? "stroke-yellow-500" : "stroke-red-500")}
                    strokeWidth="8"
                    strokeDasharray={`${result.score * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-bold">{result.score}%</span>
                </div>
              </div>
              <p className="text-lg font-bold text-foreground mb-2">{result.feedback}</p>
            </div>

            {result.errors?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-destructive mb-3">ملاحظات على القراءة:</h4>
                <div className="space-y-2">
                  {result.errors.map((err: any, i: number) => (
                    <div key={i} className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3">
                      <span className="line-through text-red-400 font-bold">{err.got}</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                      <span className="text-green-500 font-bold">{err.expected}</span>
                      {err.note && <span className="text-sm text-muted-foreground">— {err.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => { setResult(null); setRecognized(""); nextText(); }}
                className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-5 h-5" /> نص جديد
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
