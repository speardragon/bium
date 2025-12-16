import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Github, 
  ArrowRight, 
  ChevronDown, 
  Check,
  Inbox,
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Zap,
  Clock,
  Target,
  Sparkles
} from "lucide-react";
import { useStore } from "../store/useStore";
import { SupportedLanguage } from "../types";

const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

// Custom hook for scroll-triggered animations
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Animated section wrapper
function AnimatedSection({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// Floating animation for decorative elements
function FloatingElement({ children, className = "", delay = 0 }: { children?: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Guide image component with proper sizing
function GuideImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl shadow-lg ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function GuidePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings, setLanguage } = useStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((l) => l.code === settings.language) || languages[1];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {t("app.title", "비움")}
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* GitHub */}
              <a
                href="https://github.com/speardragon/bium"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>

              {/* Try App Button */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                <span>{t("guide.nav.tryApp", "Try App")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>{currentLanguage.flag}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                          ${settings.language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {settings.language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement className="absolute top-20 left-[10%] w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" delay={0} />
          <FloatingElement className="absolute top-40 right-[15%] w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" delay={1000} />
          <FloatingElement className="absolute bottom-20 left-[20%] w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" delay={2000} />
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-gray-200 shadow-sm mb-8 animate-fade-in"
            style={{ animation: 'fadeIn 0.6s ease-out' }}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600">{t("guide.hero.badge", "Queue-based Time Blocking")}</span>
          </div>

          {/* Main heading */}
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
            style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {t("guide.hero.title", "비움")}
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-2xl md:text-3xl text-gray-600 mb-4 font-light"
            style={{ animation: 'fadeIn 0.8s ease-out 0.4s both' }}
          >
            {t("guide.hero.subtitle", "비워서 채우는 시간 관리")}
          </p>

          {/* Tagline */}
          <p 
            className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto"
            style={{ animation: 'fadeIn 0.8s ease-out 0.6s both' }}
          >
            {t("guide.hero.tagline", "Intentional productivity through queue-based time blocking. Empty your mind, fill your time with purpose.")}
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            style={{ animation: 'fadeIn 0.8s ease-out 0.8s both' }}
          >
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1"
            >
              <span>{t("guide.hero.cta", "Start Using bium")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('philosophy')}
              className="flex items-center gap-2 px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <span>{t("guide.hero.learnMore", "Learn More")}</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>

          {/* Hero Image */}
          <div 
            className="relative max-w-4xl mx-auto"
            style={{ animation: 'fadeIn 1s ease-out 1s both' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <GuideImage 
              src="/guide-1.png"
              alt={t("guide.placeholder.appPreview", "Main dashboard showing weekly queue view with sidebar containing Inbox and Queue tabs")}
              className="shadow-2xl"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("guide.philosophy.title", 'The Meaning of "비움"')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection delay={200}>
              <div className="space-y-6">
                <p className="text-xl text-gray-600 leading-relaxed">
                  {t("guide.philosophy.description", 'The Korean word "비움" (Bium) comes from "비우다" (to empty). It embodies the philosophy that by creating empty space, we make room for what truly matters.')}
                </p>
                <div className="space-y-4">
                  {[
                    { 
                      icon: Inbox, 
                      text: t("guide.philosophy.point1", "Empty tasks into queues → Peace of mind"),
                      color: "blue"
                    },
                    { 
                      icon: Clock, 
                      text: t("guide.philosophy.point2", "Empty time blocks → Space for deep focus"),
                      color: "indigo"
                    },
                    { 
                      icon: CheckCircle2, 
                      text: t("guide.philosophy.point3", "Empty completed tasks → Sense of progress"),
                      color: "purple"
                    },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center`}>
                        <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                      </div>
                      <p className="text-gray-700 font-medium">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
                  <div className="text-6xl mb-4">空</div>
                  <p className="text-2xl font-light mb-2">{t("guide.philosophy.character", "Empty / Void / Space")}</p>
                  <p className="text-gray-400 text-sm">
                    {t("guide.philosophy.characterDesc", "The concept of productive emptiness - creating space for what matters")}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("guide.concept.title", "What is Queue-based Time Blocking?")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("guide.concept.subtitle", "A flexible approach to time management that adapts to your reality")}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Traditional Approach */}
            <AnimatedSection delay={200}>
              <div className="h-full p-8 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-red-500 text-xl">✕</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t("guide.concept.traditional.title", "Traditional Scheduling")}
                  </h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-red-50 rounded-lg text-sm text-gray-600 font-mono">
                    9:00 AM - Email
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-sm text-gray-600 font-mono">
                    10:00 AM - Meeting
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-sm text-gray-600 font-mono">
                    11:00 AM - Report
                  </div>
                </div>
                <p className="text-gray-500">
                  {t("guide.concept.traditional.description", "Rigid time slots. When something takes longer or unexpected tasks come up, your entire schedule falls apart.")}
                </p>
              </div>
            </AnimatedSection>

            {/* Queue-based Approach */}
            <AnimatedSection delay={400}>
              <div className="h-full p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold">
                    {t("guide.concept.queueBased.title", "Queue-based Blocking")}
                  </h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-white/10 rounded-lg text-sm font-mono backdrop-blur">
                    Deep Work Queue (2h) → Important tasks
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg text-sm font-mono backdrop-blur">
                    Admin Queue (1h) → Emails, calls
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg text-sm font-mono backdrop-blur">
                    Creative Queue (1.5h) → Design, writing
                  </div>
                </div>
                <p className="text-blue-100">
                  {t("guide.concept.queueBased.description", "Flexible time blocks. Assign tasks to queues based on type, not specific times. Work through your queue when the block arrives.")}
                </p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={600}>
            <GuideImage 
              src="/guide-2.png"
              alt={t("guide.placeholder.comparison", "Comparison diagram: Traditional scheduling (left) shows rigid hourly slots that break when disrupted. Queue-based approach (right) shows flexible task queues that adapt to changes.")}
              className="max-w-4xl mx-auto"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("guide.howItWorks.title", "How It Works")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("guide.howItWorks.subtitle", "Three simple steps to intentional productivity")}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <AnimatedSection delay={200}>
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Inbox className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("guide.howItWorks.step1.title", "Capture")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("guide.howItWorks.step1.description", "Quickly add tasks to your Inbox with time estimates. Don't worry about when - just capture everything.")}
                </p>
                <GuideImage 
                  src="/guide-3.png"
                  alt={t("guide.placeholder.inbox", "Inbox UI: Quick task entry with time slider, list of unassigned tasks")}
                />
              </div>
            </AnimatedSection>

            {/* Step 2 */}
            <AnimatedSection delay={400}>
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <LayoutGrid className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("guide.howItWorks.step2.title", "Assign")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("guide.howItWorks.step2.description", "Move tasks to appropriate queues. Deep Work, Admin, Creative - organize by the type of focus needed.")}
                </p>
                <GuideImage 
                  src="/guide-4.png"
                  alt={t("guide.placeholder.queueDashboard", "Queue Dashboard: Colored queue cards with capacity gauges, assigned tasks with checkboxes")}
                />
              </div>
            </AnimatedSection>

            {/* Step 3 */}
            <AnimatedSection delay={600}>
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("guide.howItWorks.step3.title", "Execute")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("guide.howItWorks.step3.description", "When a time block arrives, work through your queue. Check off tasks as you complete them.")}
                </p>
                <GuideImage 
                  src="/guide-5.png"
                  alt={t("guide.placeholder.weeklyView", "Weekly View: 7-day calendar with colored time blocks showing queue schedules")}
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("guide.features.title", "Key Features")}
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Inbox,
                title: t("guide.features.inbox.title", "Quick Capture"),
                description: t("guide.features.inbox.description", "Add tasks instantly with smart time estimation"),
                color: "blue"
              },
              {
                icon: Target,
                title: t("guide.features.capacity.title", "Capacity Gauge"),
                description: t("guide.features.capacity.description", "Visual feedback to prevent over-commitment"),
                color: "indigo"
              },
              {
                icon: Calendar,
                title: t("guide.features.weekView.title", "Week View"),
                description: t("guide.features.weekView.description", "See your entire week at a glance"),
                color: "purple"
              },
              {
                icon: CheckCircle2,
                title: t("guide.features.tracking.title", "Progress Tracking"),
                description: t("guide.features.tracking.description", "Check off tasks and see your accomplishments"),
                color: "green"
              }
            ].map((feature, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("guide.inspiration.title", "Inspiration")}
            </h2>
            <p className="text-gray-600">
              {t("guide.inspiration.description", "This project was inspired by the following article:")}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <a
              href="https://unnud.com/the-three-stage-evolution-of-time-management-why-you-should-create-an-empty-queue-first/"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("guide.inspiration.source", "unnud Magazine")}</p>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {t("guide.inspiration.articleTitle", "The Three-Stage Evolution of Time Management: Why You Should Create an Empty Queue First")}
                    </h3>
                  </div>
                </div>
                
                <blockquote className="relative pl-6 border-l-4 border-blue-500">
                  <p className="text-lg text-gray-600 italic leading-relaxed">
                    "{t("guide.inspiration.quote", "Time is not an empty slot to fill, but a container to hold precious things. The right order is to prepare good containers first, then choose what to put in them.")}"
                  </p>
                </blockquote>

                <div className="mt-6 flex items-center gap-2 text-blue-600 font-medium">
                  <span>{t("guide.hero.learnMore", "Learn More")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient" />
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("guide.cta.title", "Ready to empty your mind?")}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t("guide.cta.subtitle", "Free, open source, no sign-up required. Start organizing your time with intention.")}
            </p>
            <button
              onClick={() => navigate("/")}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all hover:-translate-y-1"
            >
              <span>{t("guide.cta.button", "Start Using bium")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">{t("app.title", "비움")}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/speardragon/bium"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>

            <p className="text-sm">
              {t("guide.footer.copyright", "© 2024 bium")} · {t("guide.footer.madeWith", "Made with ♥")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
