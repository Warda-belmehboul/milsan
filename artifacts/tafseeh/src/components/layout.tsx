import { Link, useLocation } from "wouter";
import {
  Book, PenTool, Users, Feather,
  GraduationCap, Gamepad2, Mic, Settings, Menu, X, UserPlus, Inbox, ChevronDown, BookOpen
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/tafseeh", label: "فصح نصك آليا", icon: PenTool },
  { href: "/proofreaders", label: "اتصل بمفصحين", icon: Users },
  { href: "/join", label: "انضم كمفصح", icon: UserPlus },
  { href: "/spelling", label: "مصحح القراءة والإملاء", icon: Mic },
  { href: "/courses", label: "الدورات", icon: GraduationCap },
  { href: "/quiz", label: "الألعاب اللغوية", icon: Gamepad2 },
];

const mobileNavItems = [
  { href: "/dictionary", label: "معجم الأساليب الفصيحة", icon: Book },
  { href: "/rhymes", label: "معجم العبارات البديعة", icon: Feather },
  ...navItems,
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);
  const dictRef = useRef<HTMLDivElement>(null);

  const isDictActive = location === "/dictionary" || location === "/rhymes";

  return (
    <div className="min-h-screen flex flex-col relative" dir="rtl">
      {/* Dark brown top banner */}
      <div className="h-3 bg-primary w-full" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-primary shadow-lg shadow-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/15 border border-white/30 rounded-2xl px-4 py-1.5 flex items-center gap-2 group-hover:bg-white/20 transition-all">
              <img
                src="/logo.jpeg"
                alt="ملسان"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-display font-bold text-xl text-white tracking-wide">
                مِلْسَان
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {/* معاجم Dropdown */}
            <div
              ref={dictRef}
              className="relative"
              onMouseEnter={() => setDictOpen(true)}
              onMouseLeave={() => setDictOpen(false)}
            >
              <button
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                  isDictActive
                    ? "bg-white/25 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                معاجم
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", dictOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {dictOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 bg-white border border-primary/20 rounded-xl shadow-xl p-2 min-w-[200px] z-50"
                  >
                    <Link
                      href="/dictionary"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors",
                        location === "/dictionary"
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:text-primary hover:bg-primary/8"
                      )}
                    >
                      <Book className="w-4 h-4 flex-shrink-0" />
                      معجم الأساليب الفصيحة
                    </Link>
                    <Link
                      href="/rhymes"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors",
                        location === "/rhymes"
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:text-primary hover:bg-primary/8"
                      )}
                    >
                      <Feather className="w-4 h-4 flex-shrink-0" />
                      معجم العبارات البديعة
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                  location === item.href
                    ? "bg-white/25 text-white shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                )}
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
            <div className="w-px h-6 bg-white/25 mx-1.5" />
            <Link
              href="/proofreader-dashboard"
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                location === "/proofreader-dashboard"
                  ? "bg-white/25 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/15"
              )}
            >
              <Inbox className="w-3.5 h-3.5 flex-shrink-0" />
              لوحة المفصح
            </Link>
            <div className="w-px h-6 bg-white/25 mx-1.5" />
            <Link
              href="/admin"
              className="px-3 py-2 rounded-lg text-xs font-bold text-white/80 hover:text-white hover:bg-white/15 transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 flex-shrink-0" />
              الإدارة
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/15 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-primary/95 backdrop-blur-md border-b border-white/15 overflow-hidden z-40"
          >
            <nav className="flex flex-col p-4 gap-1.5">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3",
                    location === item.href
                      ? "bg-white/25 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="h-px w-full bg-white/20 my-1" />
              <Link href="/proofreader-dashboard" onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/15 flex items-center gap-3">
                <Inbox className="w-4 h-4" /> لوحة المفصح
              </Link>
              <div className="h-px w-full bg-white/20 my-1" />
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold text-white/80 hover:text-white flex items-center gap-3">
                <Settings className="w-4 h-4" /> لوحة الإدارة
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary border-t border-white/15 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <img src="/logo.jpeg" alt="ملسان" className="w-7 h-7 rounded-full object-cover" />
              <p className="font-display font-bold text-lg text-white">مِلْسَان</p>
            </div>
            <p className="text-white/60 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <Link href="/dictionary" className="text-white/70 hover:text-white transition-colors">معجم الأساليب الفصيحة</Link>
            <Link href="/rhymes" className="text-white/70 hover:text-white transition-colors">معجم العبارات البديعة</Link>
            <Link href="/courses" className="text-white/70 hover:text-white transition-colors">الدورات</Link>
            <Link href="/join" className="text-white/70 hover:text-white transition-colors">انضم كمفصح</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
