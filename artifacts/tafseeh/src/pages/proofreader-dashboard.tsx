import { useState } from "react";
import { Layout } from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Inbox, Send, ChevronDown, ChevronUp, Mail, User, Clock, CheckCircle2, LogIn, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type MessageThread = {
  id: number;
  senderName: string;
  senderEmail: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  replies: {
    id: number;
    senderName: string;
    content: string;
    isFromProofreader: boolean;
    createdAt: string;
  }[];
};

type InboxData = {
  proofreader: { id: number; name: string; email: string; status: string };
  threads: MessageThread[];
};

async function fetchInbox(email: string): Promise<InboxData> {
  const res = await fetch(`/api/messages/inbox?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "فشل التحميل");
  }
  return res.json();
}

async function sendReply(messageId: number, proofreaderEmail: string, content: string) {
  const res = await fetch(`/api/messages/${messageId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proofreaderEmail, content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "فشل الإرسال");
  }
  return res.json();
}

export default function ProofreaderDashboard() {
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  const { data, isLoading, error } = useQuery<InboxData, Error>({
    queryKey: ["proofreader-inbox", email],
    queryFn: () => fetchInbox(email),
    enabled: !!email,
    retry: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setEmail(inputEmail.trim().toLowerCase());
  };

  if (error && email) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="glass-panel p-8 rounded-3xl text-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-destructive">{error.message}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              تأكد من صحة البريد الإلكتروني المسجل في المنصة.
            </p>
            <button onClick={() => { setEmail(""); setInputEmail(""); }} className="px-6 py-2 bg-card border border-border rounded-xl font-bold">
              المحاولة مجدداً
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!email) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-3xl w-full max-w-sm text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">لوحة المفصح</h2>
            <p className="text-muted-foreground text-sm mb-8">
              أدخل بريدك الإلكتروني المسجل لعرض رسائلك
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                required
                value={inputEmail}
                onChange={(e) => { setInputEmail(e.target.value); setLoginError(""); }}
                placeholder="your@email.com"
                dir="ltr"
                className="w-full p-3 rounded-xl bg-background border border-border text-center outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
              />
              {loginError && <p className="text-destructive text-sm">{loginError}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                <LogIn className="w-5 h-5" /> عرض الرسائل
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-6">
              لست مفصحاً بعد؟{" "}
              <a href="/join" className="text-primary hover:underline">سجل هنا</a>
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const unread = data?.threads.filter(t => !t.isRead).length ?? 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Inbox className="w-8 h-8 text-primary" />
              صندوق الرسائل
            </h1>
            <p className="text-muted-foreground mt-1">
              مرحباً، <strong className="text-foreground">{data?.proofreader.name}</strong>
              {unread > 0 && (
                <span className="mr-2 text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                  {unread} جديدة
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={data?.proofreader.status ?? ""} />
            <button
              onClick={() => { setEmail(""); setInputEmail(""); }}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-destructive"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Threads */}
        {!data?.threads.length ? (
          <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-xl font-bold mb-2">لا توجد رسائل بعد</p>
            <p className="text-sm">ستظهر رسائل العملاء هنا بعد الموافقة على حسابك.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.threads.map((thread, i) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                proofreaderEmail={email}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ThreadCard({ thread, proofreaderEmail, index }: {
  thread: MessageThread;
  proofreaderEmail: string;
  index: number;
}) {
  const [open, setOpen] = useState(!thread.isRead && index === 0);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: reply, isPending } = useMutation({
    mutationFn: () => sendReply(thread.id, proofreaderEmail, replyText),
    onSuccess: () => {
      setReplyText("");
      toast({ title: "تم إرسال ردك بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["proofreader-inbox", proofreaderEmail] });
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const allMessages = [
    { ...thread, isFromProofreader: false },
    ...thread.replies,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass-panel rounded-2xl overflow-hidden border",
        !thread.isRead ? "border-primary/40" : "border-border"
      )}
    >
      {/* Thread Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 hover:bg-card/50 transition-colors text-right"
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg",
          !thread.isRead ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {thread.senderName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-foreground">{thread.senderName}</span>
            {!thread.isRead && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">جديد</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{thread.content}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            {new Date(thread.createdAt).toLocaleDateString("ar-SA")}
          </div>
          {thread.replies.length > 0 && (
            <span className="text-xs bg-card border border-border px-2 py-0.5 rounded-full">
              {thread.replies.length + 1} رسائل
            </span>
          )}
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Thread Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Messages */}
              {allMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.isFromProofreader ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                    msg.isFromProofreader
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-secondary-foreground"
                  )}>
                    {msg.isFromProofreader ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl p-4",
                    msg.isFromProofreader
                      ? "bg-primary/10 border border-primary/20 rounded-tl-none"
                      : "bg-card border border-border rounded-tr-none"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("font-bold text-sm", msg.isFromProofreader ? "text-primary" : "text-foreground")}>
                        {msg.isFromProofreader ? "أنت" : msg.senderName}
                      </span>
                      {!msg.isFromProofreader && (
                        <a
                          href={`mailto:${(msg as MessageThread).senderEmail}`}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(msg as MessageThread).senderEmail}
                        </a>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Reply Box */}
              <div className="border-t border-border pt-4 mt-4">
                <label className="block text-sm font-bold text-muted-foreground mb-2">ردك:</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  dir="rtl"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => reply()}
                    disabled={!replyText.trim() || isPending}
                    className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/20 transition-all text-sm"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    إرسال الرد
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    approved: { label: "حساب معتمد ✓", className: "bg-green-500/20 text-green-500 border-green-500/30" },
    pending: { label: "قيد المراجعة", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    suspended: { label: "موقوف", className: "bg-red-500/20 text-red-500 border-red-500/30" },
  };
  const s = map[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${s.className}`}>
      {s.label}
    </span>
  );
}
