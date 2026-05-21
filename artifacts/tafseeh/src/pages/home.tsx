import { Link } from "wouter";
import { motion } from "framer-motion";
import { Book, PenTool, Users, GraduationCap, Gamepad2, Mic, UserPlus, Headphones, Globe } from "lucide-react";
import { Layout } from "@/components/layout";

const sections = [
  { icon: Book, title: "المعاجم", href: "/dictionary" },
  { icon: PenTool, title: "فصح نصك آليا", href: "/tafseeh" },
  { icon: Users, title: "اتصل بالمفصحين", href: "/proofreaders" },
  { icon: Mic, title: "مصحح القراءة والإملاء", href: "/spelling" },
  { icon: Gamepad2, title: "الألعاب اللغوية", href: "/quiz" },
  { icon: GraduationCap, title: "دورات تدريبية", href: "/courses" },
];

const diamondTiles = [
  { icon: Headphones, label: "الدورات", href: "/courses" },
  { icon: Book, label: "المعاجم", href: "/dictionary" },
  { icon: Globe, label: "التواصل", href: "/proofreaders" },
  { icon: Mic, label: "الإملاء", href: "/spelling" },
  { icon: PenTool, label: "التفصيح", href: "/tafseeh" },
  { icon: Gamepad2, label: "الألعاب", href: "/quiz" },
  { icon: Users, label: "المفصحون", href: "/proofreaders" },
  { icon: GraduationCap, label: "التعلم", href: "/courses" },
];

const stats = [
  { value: "+5000", label: "عبارة في المعجم" },
  { value: "+200", label: "عبارة بديعية" },
  { value: "+50", label: "مفصح معتمد" },
  { value: "24/7", label: "خدمة التفصيح الآلي" },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center">
        {/* Background pattern overlay - lighter in hero */}
        <div className="absolute inset-0 bg-white/60 z-0" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 flex items-center justify-between gap-8">
          {/* Left: Platform label card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-shrink-0 hidden md:block"
          >
            <div className="border-2 border-primary rounded-3xl px-8 py-6 bg-white/70 backdrop-blur-sm shadow-lg shadow-primary/10">
              <p className="font-display text-2xl font-bold text-primary leading-relaxed text-center">
                منصَّة<br />التَّفصيح<br />وتحسين<br />الأسلوب
              </p>
            </div>
          </motion.div>

          {/* Center: Logo + Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex-1 text-center flex flex-col items-center gap-6"
          >
            {/* Logo badge */}
            <div className="bg-primary rounded-3xl px-10 py-4 shadow-xl shadow-primary/30">
              <span className="font-display font-bold text-4xl text-white tracking-widest">
                مِلْسَان
              </span>
            </div>

            {/* Tagline */}
            <p className="font-display text-3xl md:text-4xl text-gradient-gold font-bold leading-relaxed">
              بوّابتك لتأنيق لغتك
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link
                href="/tafseeh"
                className="btn-primary text-base px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/30"
              >
                <PenTool className="w-4 h-4" />
                جرب التفصيح الآلي
              </Link>
              <Link
                href="/dictionary"
                className="px-8 py-3 rounded-2xl text-base font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2"
              >
                <Book className="w-4 h-4" />
                تصفح المعجم
              </Link>
            </div>
          </motion.div>

          {/* Right: Diamond tiles grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-shrink-0 hidden lg:block"
          >
            <div className="relative w-64 h-72">
              {/* Arrange diamonds in a diagonal grid */}
              {[
                { tile: diamondTiles[0], top: 0, right: 80 },
                { tile: diamondTiles[1], top: 0, right: 0 },
                { tile: diamondTiles[2], top: 0, right: 160 },
                { tile: diamondTiles[3], top: 80, right: 40 },
                { tile: diamondTiles[4], top: 80, right: 120 },
                { tile: diamondTiles[5], top: 160, right: 0 },
                { tile: diamondTiles[6], top: 160, right: 80 },
                { tile: diamondTiles[7], top: 160, right: 160 },
              ].map(({ tile, top, right }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="absolute group"
                  style={{ top, right }}
                >
                  <Link href={tile.href} title={tile.label}>
                    <div
                      className="w-16 h-16 bg-primary flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer transition-all duration-200 group-hover:bg-secondary group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/40"
                      style={{ borderRadius: "18px", transform: "rotate(45deg)" }}
                    >
                      <tile.icon
                        className="w-7 h-7 text-white"
                        style={{ transform: "rotate(-45deg)" }}
                      />
                    </div>
                    {/* Tooltip label */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                        {tile.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 bg-primary/5 border-y border-primary/15">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="text-center py-4"
            >
              <p className="text-3xl font-display font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sections Grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient-primary">
              أقسام المنصة
            </h2>
            <div className="section-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {sections.map((section, i) => (
              <motion.div
                key={section.href}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={section.href} className="block group">
                  {/* Card with protruding icon */}
                  <div className="relative pt-8">
                    {/* Protruding icon circle */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-white group-hover:scale-110 transition-transform">
                        <section.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Brown card */}
                    <div className="bg-primary rounded-3xl pt-12 pb-7 px-6 text-center shadow-xl shadow-primary/25 hover-lift min-h-[110px] flex items-end justify-center">
                      <h3 className="font-display font-bold text-white text-xl leading-tight">
                        {section.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto text-center bg-primary rounded-3xl p-12 shadow-2xl shadow-primary/25">
          <h2 className="text-3xl font-display font-bold text-white mb-4">انضم إلى مِلْسَان</h2>
          <p className="text-white/75 mb-8">
            شارك خبرتك اللغوية مع آلاف المستخدمين وكن جزءاً من مجتمع الفصاحة العربية.
          </p>
          <Link href="/join" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-all shadow-lg">
            <UserPlus className="w-5 h-5" />
            انضم كمفصح
          </Link>
        </div>
      </section>
    </Layout>
  );
}
