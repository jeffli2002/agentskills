import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import type { Skill } from '@agentskills/shared';
import { getSkills, getCategoriesWithCounts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';
import { SearchBar } from '@/components/skills/SearchBar';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Bot,
  BarChart3,
  Palette,
  Wrench,
  Lock,
  Package,
  Users,
  Download,
  Star,
  CheckCircle,
  User,
  Rocket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Server,
  Brain,
  FileText,
  TestTube,
  GitBranch,
  Code,
  Database,
  Briefcase,
  FlaskConical,
  Sparkles,
  ThumbsUp,
  ArrowRightLeft,
} from 'lucide-react';

// Category icons mapping - user-friendly categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Science': FlaskConical,
  'AI & ML': Brain,
  'Documentation': FileText,
  'Prompts & Agents': Bot,
  'Code Management': GitBranch,
  'DevOps & Tooling': Wrench,
  'Automation': Zap,
  'Database': Database,
  'Design': Palette,
  'Frontend': Code,
  'Business': Briefcase,
  'Testing': TestTube,
  'Security': Lock,
  'Analytics': BarChart3,
  'Backend': Server,
  'Blockchain': Package,
  'other': Package,
};

// Trust indicators
const trustMetrics = [
  { label: 'Agent Skills', value: '1,000+', icon: Package },
  { label: 'Community Members', value: '5,000+', icon: Users },
  { label: 'Downloads', value: '50K+', icon: Download },
  { label: 'Avg Rating', value: '4.8/5', icon: ThumbsUp }
];

// Feature highlights
const features = [
  {
    title: 'Built on Proven Skills',
    description: 'Our Skill Composer learns from top-rated community skills to generate yours. Built on what works, not from scratch.',
    icon: Brain
  },
  {
    title: 'OpenClaw Converter',
    description: 'Convert any skill to OpenClaw format. Paste, import from GitHub, or transform marketplace skills with validation.',
    icon: ArrowRightLeft
  },
  {
    title: 'Community Ratings',
    description: 'Real reviews from developers like you. Make informed decisions with transparent feedback.',
    icon: Star
  },
  {
    title: 'Easy Integration',
    description: 'One-click install for Claude skills and compatible AI coding assistants. Start using agent skills instantly.',
    icon: Rocket
  }
];

// FAQ data
const faqs = [
  {
    question: 'What are Agent Skills?',
    answer: 'Agent skills are reusable SKILL.md files that extend AI coding assistants like Claude Code and Codex CLI. They define specialized capabilities, workflows, and knowledge that AI agents can use to automate tasks, integrate with tools, or provide domain expertise.'
  },
  {
    question: 'How do I install a skill?',
    answer: 'Click the "Download ZIP" button on any skill page to get the SKILL.md file. Place it in your project\'s .claude/skills/ directory or your global Claude Code skills folder. The skill will be automatically available in your next Claude Code session.'
  },
  {
    question: 'How do I create my own skill?',
    answer: 'Use our Skill Composer! Click "Create with AI" to describe what you want your skill to do. Our AI will ask clarifying questions, then generate a professional SKILL.md file based on proven patterns from top-rated community skills. You can edit, regenerate, and publish directly from the composer.'
  },
  {
    question: 'What is the Skill Composer?',
    answer: 'The Skill Composer analyzes proven, top-rated skills from our marketplace to generate yours. It learns what works—descriptions, structures, patterns—then applies those learnings to your needs. Simply describe your idea, answer a few clarifying questions, and get a complete, well-structured SKILL.md file built on community best practices.'
  },
  {
    question: 'Are skills free to use?',
    answer: 'Yes! All skills in the marketplace are free to download and use. We believe in open knowledge sharing to help the AI agent community grow. Creators earn recognition through ratings, favorites, and community visibility.'
  },
  {
    question: 'How are skills reviewed and rated?',
    answer: 'Skills are rated by the community on a 5-star scale. You can favorite skills to save them for later and help others discover quality content. Popular skills with high ratings appear in featured sections and category highlights.'
  },
  {
    question: 'Can I keep my skills private?',
    answer: 'Yes! When publishing from the Skill Composer, you can choose to publish publicly (visible to everyone) or keep it private (only visible to you in My Skills). Private skills can be made public later if you decide to share them.'
  },
  {
    question: 'Where can I find my created skills?',
    answer: 'All skills you create are saved in "My Skills" accessible from the header navigation. From there you can view, download, and manage all your creations whether they\'re public or private.'
  },
  {
    question: 'How do I enable a skill on my VPS or local machine?',
    answer: 'Use the CLI: npx agentskills install <skill-name> --global. This auto-detects your agents (OpenClaw, Claude Code, Cursor, etc.) and places the SKILL.md in the right directory. On a VPS without Node.js, use curl: curl -o ~/.openclaw/skills/<skill-name>/SKILL.md "https://agentskills.cv/api/skills/<skill-id>/export/openclaw". For a downloaded SKILL.md file, copy it to your agent\'s skills directory (e.g., ~/.openclaw/skills/<skill-name>/ or ~/.claude/skills/<skill-name>/).'
  }
];

export function HomePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);
  const CATEGORIES_PER_PAGE = 6;

  console.log('HomePage rendering');

  // Fallback categories if API returns empty or few
  const defaultCategories = [
    { category: 'AI & ML', count: 84 },
    { category: 'Automation', count: 82 },
    { category: 'Documentation', count: 48 },
    { category: 'Code Management', count: 38 },
    { category: 'Backend', count: 36 },
    { category: 'Science', count: 35 },
    { category: 'Prompts & Agents', count: 33 },
    { category: 'Testing', count: 32 },
    { category: 'Database', count: 30 },
    { category: 'Security', count: 25 },
    { category: 'Frontend', count: 25 },
    { category: 'DevOps & Tooling', count: 21 },
    { category: 'Analytics', count: 21 },
    { category: 'Design', count: 15 },
    { category: 'Business', count: 11 },
    { category: 'Blockchain', count: 7 },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [skillsResponse, categoriesData] = await Promise.all([
          getSkills({ sort: 'stars', limit: 6 }),
          getCategoriesWithCounts()
        ]);
        setSkills(skillsResponse.data);
        // Use top 3 skills for featured carousel
        setFeaturedSkills(skillsResponse.data.slice(0, 3));
        // Use API categories if we get more than 5, otherwise use defaults
        // Sort to put "other" category last
        const sortedCategories = (categoriesData.length > 5 ? categoriesData : defaultCategories)
          .sort((a, b) => {
            if (a.category.toLowerCase() === 'other') return 1;
            if (b.category.toLowerCase() === 'other') return -1;
            return b.count - a.count;
          });
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Sort defaults with "other" last
        setCategories(defaultCategories.sort((a, b) => {
          if (a.category.toLowerCase() === 'other') return 1;
          if (b.category.toLowerCase() === 'other') return -1;
          return b.count - a.count;
        }));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (featuredSkills.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSkills.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [featuredSkills.length]);

  const handleFavoriteChange = (skillId: string, isFavorited: boolean) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, isFavorited } : s
      )
    );
  };

  const handleRatingChange = (skillId: string, avgRating: number, ratingCount: number) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, avgRating, ratingCount } : s
      )
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query: string) => {
    // Only navigate if there's a search query
    if (query.trim()) {
      window.location.href = `/skills?q=${encodeURIComponent(query)}`;
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredSkills.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredSkills.length) % featuredSkills.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Search Focused */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Gradient overlay for hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border mb-6">
              <span className="text-sm font-medium text-gold">Agent Skills Marketplace</span>
              <Badge variant="secondary" className="bg-accent text-foreground border-0">
                New
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-foreground">
              Discover & Create
              <br />
              <span className="text-gold-shimmer">the Best AI Agent Skills</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Create agent skills powered by proven patterns from the community's best.
              Discover, download, and share with AI coding assistants.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                onChange={handleSearch}
                onSubmit={handleSearchSubmit}
                placeholder="Search agent skills... (e.g., 'git automation', 'code review')"
                className="bg-secondary border-border text-foreground"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/skills">
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 hover:scale-105 border-0 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer"
                >
                  Browse All Skills
                </Button>
              </Link>
              <Link to="/create">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90 hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create with AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Bar */}
      <section className="py-8 bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="text-center">
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Featured Carousel - 每日精选 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
            Daily Featured
          </h2>

          {loading ? (
            <div className="max-w-4xl mx-auto h-64 bg-secondary rounded-xl animate-pulse" />
          ) : featuredSkills.length > 0 ? (
            <div className="max-w-4xl mx-auto relative">
              {/* Carousel Container */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                {/* Slides */}
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredSkills.map((skill) => (
                    <div key={skill.id} className="min-w-full p-8 md:p-12">
                      <Link to={`/skills/${skill.id}`}>
                        <div className="cursor-pointer">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 hover:text-muted-foreground transition-colors">
                                {skill.name}
                              </h3>
                              <p className="text-muted-foreground text-lg mb-4 line-clamp-2">
                                {skill.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {skill.author}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                  {skill.starsCount?.toLocaleString() || 0}
                                </span>
                                {skill.avgRating && (
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4" style={{ color: '#D4A017', fill: '#D4A017' }} />
                                    {skill.avgRating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Button className="bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-200 cursor-pointer">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {featuredSkills.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary/90 hover:bg-secondary shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 border border-border"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary/90 hover:bg-secondary shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 border border-border"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-6 h-6 text-foreground" />
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {featuredSkills.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {featuredSkills.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                        index === currentSlide
                          ? 'bg-foreground w-8'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
            Browse by Category
          </h2>
          <div className="flex items-center justify-center gap-4 max-w-6xl mx-auto">
            {/* Left Arrow */}
            <button
              onClick={() => setCategoryStartIndex((prev) =>
                prev === 0 ? Math.max(0, categories.length - CATEGORIES_PER_PAGE) : prev - CATEGORIES_PER_PAGE
              )}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border hover:border-foreground/50 hover:bg-secondary flex items-center justify-center transition-all duration-200 cursor-pointer"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
              {categories.slice(categoryStartIndex, categoryStartIndex + CATEGORIES_PER_PAGE).map((cat, index) => {
                const IconComponent = categoryIcons[cat.category] || Package;
                return (
                  <Link key={index} to={`/skills?category=${encodeURIComponent(cat.category)}`}>
                    <div className="group p-6 rounded-xl border border-border hover:border-foreground/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center cursor-pointer bg-card h-full">
                      <IconComponent className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all duration-200" />
                      <h3 className="font-semibold text-foreground mb-1 text-sm capitalize truncate">
                        {cat.category.replace(/-/g, ' ')}
                      </h3>
                      <p className="text-xs text-muted-foreground">{cat.count} skills</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setCategoryStartIndex((prev) =>
                prev + CATEGORIES_PER_PAGE >= categories.length ? 0 : prev + CATEGORIES_PER_PAGE
              )}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border hover:border-foreground/50 hover:bg-secondary flex items-center justify-center transition-all duration-200 cursor-pointer"
              aria-label="Next categories"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Page Indicator */}
          {categories.length > CATEGORIES_PER_PAGE && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(categories.length / CATEGORIES_PER_PAGE) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCategoryStartIndex(index * CATEGORIES_PER_PAGE)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    Math.floor(categoryStartIndex / CATEGORIES_PER_PAGE) === index
                      ? 'bg-foreground w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to category page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Popular Skills
              </h2>
              <p className="text-muted-foreground">
                Top-rated skills from the community
              </p>
            </div>
            <Link to="/skills">
              <Button variant="ghost" className="cursor-pointer hover:bg-secondary">
                View all →
              </Button>
            </Link>
          </div>
          <SkillList
            skills={skills}
            loading={loading}
            emptyMessage="No skills available yet"
            onFavoriteChange={handleFavoriteChange}
            onRatingChange={handleRatingChange}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Why Choose Agent Skills Marketplace?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A trusted platform for Claude skills and agent skills built for the AI coding community
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-border">
                    <IconComponent className="w-8 h-8 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
              Frequently Asked Questions about Claude Skills
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-colors duration-200 bg-card"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
                  >
                    <span className="font-semibold text-foreground pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 py-4 bg-secondary/30 border-t border-border">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/50 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers extending their AI agents with community-built agent skills
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/skills">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer"
              >
                Explore Skills
              </Button>
            </Link>
            <Link to="/create">
              <Button
                size="lg"
                className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90 hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
