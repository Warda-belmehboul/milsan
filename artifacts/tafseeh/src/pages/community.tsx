import { useState } from "react";
import { Layout } from "@/components/layout";
import { MessageSquare, PlusCircle, Heart, Reply, ArrowRight, X, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = ["الكل", "نقاشات لغوية", "أسئلة نحوية", "تقاسم نصوص", "بلاغة وأدب", "عام"];

type Post = {
  id: number; title: string; content: string;
  authorName: string; authorInitial: string;
  category: string; likesCount: number; repliesCount: number;
  createdAt: string;
};
type Reply = {
  id: number; postId: number; content: string;
  authorName: string; authorInitial: string; createdAt: string;
};

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-12 h-12 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold font-display flex-shrink-0`}>
      {initial}
    </div>
  );
}

function PostCard({ post, onOpen, onLike }: { post: Post; onOpen: () => void; onLike: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-5 hover-lift cursor-pointer border border-border/60 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar initial={post.authorInitial} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-sm">{post.authorName}</span>
            <span className="badge-primary text-xs">{post.category}</span>
            <span className="text-xs text-muted-foreground mr-auto">{timeAgo(post.createdAt)}</span>
          </div>
          <h3 className="font-display font-bold text-lg leading-tight text-foreground">{post.title}</h3>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">{post.content}</p>
      <div className="flex items-center gap-4">
        <button onClick={e => { e.stopPropagation(); onLike(); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-4 h-4" /> {post.likesCount}
        </button>
        <button onClick={onOpen}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <MessageSquare className="w-4 h-4" /> {post.repliesCount} ردود
        </button>
        <button onClick={onOpen}
          className="mr-auto flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2 transition-all">
          قراءة المزيد <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function PostDetail({ postId, onClose }: { postId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [replyForm, setReplyForm] = useState({ content: "", authorName: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["community-post", postId],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/community/posts/${postId}`);
      return r.json() as Promise<{ post: Post; replies: Reply[] }>;
    }
  });

  const { mutate: addReply, isPending } = useMutation({
    mutationFn: async (body: { content: string; authorName: string }) => {
      const r = await fetch(`${BASE}/api/community/posts/${postId}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-post", postId] });
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      setReplyForm({ content: "", authorName: "" });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-foreground/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel-strong rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-bold text-xl text-gradient-primary">الموضوع</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Post content */}
            <div className="p-5 border-b border-border/50">
              <div className="flex items-start gap-3 mb-3">
                <Avatar initial={data.post.authorInitial} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{data.post.authorName}</span>
                    <span className="badge-primary">{data.post.category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(data.post.createdAt)}</span>
                </div>
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">{data.post.title}</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.post.content}</p>
            </div>

            {/* Replies */}
            <div className="p-5">
              <h4 className="font-bold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> {data.replies.length} ردود
              </h4>
              <div className="space-y-4">
                {data.replies.map(reply => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <Avatar initial={reply.authorInitial} size="sm" />
                    <div className="flex-1 bg-muted/40 rounded-xl p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{reply.authorName}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              <div className="mt-5 pt-4 border-t border-border/50">
                <h5 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Reply className="w-4 h-4 text-primary" /> أضف رداً
                </h5>
                <div className="space-y-3">
                  <input value={replyForm.authorName} onChange={e => setReplyForm(f => ({ ...f, authorName: e.target.value }))}
                    placeholder="اسمك..." className="input-field" />
                  <textarea value={replyForm.content} onChange={e => setReplyForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="اكتب ردك هنا..." className="input-field resize-none h-20" />
                  <button
                    onClick={() => replyForm.content && replyForm.authorName && addReply(replyForm)}
                    disabled={isPending || !replyForm.content || !replyForm.authorName}
                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    إرسال الرد
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export default function Community() {
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [openPostId, setOpenPostId] = useState<number | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", authorName: "", category: "عام" });

  const { data, isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/community/posts?limit=50`);
      return r.json() as Promise<{ data: Post[]; total: number }>;
    }
  });

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch(`${BASE}/api/community/posts`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      setForm({ title: "", content: "", authorName: "", category: "عام" });
      setShowNewPost(false);
    }
  });

  const { mutate: likePost } = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${BASE}/api/community/posts/${id}/like`, { method: "POST" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] })
  });

  const filtered = data?.data.filter(p =>
    activeCategory === "الكل" || p.category === activeCategory
  ) || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">تواصل مع المجتمع</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-3">مجتمع المفصحين</h1>
          <p className="text-muted-foreground text-lg">شارك أفكارك، ناقش، واستفد من خبرات المهتمين بالفصاحة والبيان</p>
          <div className="section-divider" />
        </div>

        {/* Stats + New Post */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{data?.total ?? 0}</span> موضوع
          </div>
          <button onClick={() => setShowNewPost(!showNewPost)}
            className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            موضوع جديد
          </button>
        </div>

        {/* New Post Form */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass-panel-strong rounded-2xl p-6 border border-primary/20">
                <h3 className="font-display font-bold text-xl mb-4 text-gradient-primary">إنشاء موضوع جديد</h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                      placeholder="اسمك..." className="input-field" />
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="input-field">
                      {CATEGORIES.filter(c => c !== "الكل").map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="عنوان الموضوع..." className="input-field text-base font-bold" />
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="اكتب موضوعك هنا..." className="input-field resize-none h-32" />
                  <div className="flex gap-3">
                    <button
                      onClick={() => form.title && form.content && form.authorName && createPost(form)}
                      disabled={isPending || !form.title || !form.content || !form.authorName}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50">
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      نشر الموضوع
                    </button>
                    <button onClick={() => setShowNewPost(false)}
                      className="px-5 py-2.5 rounded-xl bg-card border border-border font-bold hover:bg-muted/50 transition-colors">
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-1 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-card border border-border hover:bg-primary/10 hover:text-primary text-muted-foreground"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-muted-foreground">جارٍ تحميل المواضيع...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onOpen={() => setOpenPostId(post.id)}
                onLike={() => likePost(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-2xl border border-border/60">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-2xl font-display text-muted-foreground mb-2">لا توجد مواضيع بعد</h3>
            <p className="text-muted-foreground/70 text-sm mb-4">كن أول من يبدأ نقاشاً</p>
            <button onClick={() => setShowNewPost(true)} className="btn-primary flex items-center gap-2 mx-auto">
              <PlusCircle className="w-4 h-4" /> ابدأ موضوعاً الآن
            </button>
          </div>
        )}

        {/* Post Detail Modal */}
        <AnimatePresence>
          {openPostId !== null && (
            <PostDetail postId={openPostId} onClose={() => setOpenPostId(null)} />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
