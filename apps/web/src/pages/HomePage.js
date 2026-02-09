import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getSkills, getCategoriesWithCounts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SkillList } from '@/components/skills/SkillList';
import { SearchBar } from '@/components/skills/SearchBar';
import { Badge } from '@/components/ui/badge';
import { Zap, Bot, BarChart3, Palette, Wrench, Lock, Package, Users, Download, Star, User, Rocket, ChevronLeft, ChevronRight, ChevronDown, Server, Brain, FileText, TestTube, GitBranch, Code, Database, Briefcase, FlaskConical, Sparkles, ThumbsUp, ArrowRightLeft, } from 'lucide-react';
// Category icons mapping - user-friendly categories
const categoryIcons = {
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
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredSkills, setFeaturedSkills] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [categories, setCategories] = useState([]);
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
                    if (a.category.toLowerCase() === 'other')
                        return 1;
                    if (b.category.toLowerCase() === 'other')
                        return -1;
                    return b.count - a.count;
                });
                setCategories(sortedCategories);
            }
            catch (error) {
                console.error('Failed to fetch data:', error);
                // Sort defaults with "other" last
                setCategories(defaultCategories.sort((a, b) => {
                    if (a.category.toLowerCase() === 'other')
                        return 1;
                    if (b.category.toLowerCase() === 'other')
                        return -1;
                    return b.count - a.count;
                }));
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    // Auto-advance carousel
    useEffect(() => {
        if (featuredSkills.length === 0)
            return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredSkills.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(timer);
    }, [featuredSkills.length]);
    const handleFavoriteChange = (skillId, isFavorited) => {
        setSkills((prev) => prev.map((s) => s.id === skillId ? { ...s, isFavorited } : s));
    };
    const handleRatingChange = (skillId, avgRating, ratingCount) => {
        setSkills((prev) => prev.map((s) => s.id === skillId ? { ...s, avgRating, ratingCount } : s));
    };
    const handleSearch = (query) => {
        setSearchQuery(query);
    };
    const handleSearchSubmit = (query) => {
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
    return (_jsxs("div", { className: "min-h-screen", children: [_jsxs("section", { className: "relative py-20 md:py-28 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" }), _jsx("div", { className: "container mx-auto px-4 relative z-10", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border mb-6", children: [_jsx("span", { className: "text-sm font-medium text-gold", children: "Agent Skills Marketplace" }), _jsx(Badge, { variant: "secondary", className: "bg-accent text-foreground border-0", children: "New" })] }), _jsxs("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-foreground", children: ["Discover & Create", _jsx("br", {}), _jsx("span", { className: "text-gold-shimmer", children: "the Best AI Agent Skills" })] }), _jsx("p", { className: "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10", children: "Create agent skills powered by proven patterns from the community's best. Discover, download, and share with AI coding assistants." }), _jsx("div", { className: "max-w-2xl mx-auto mb-8", children: _jsx(SearchBar, { onChange: handleSearch, onSubmit: handleSearchSubmit, placeholder: "Search agent skills... (e.g., 'git automation', 'code review')", className: "bg-secondary border-border text-foreground" }) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center items-center", children: [_jsx(Link, { to: "/skills", children: _jsx(Button, { size: "lg", className: "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 border-0 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer", children: "Browse All Skills" }) }), _jsx(Link, { to: "/create", children: _jsxs(Button, { size: "lg", className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90 hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer", children: [_jsx(Sparkles, { className: "w-5 h-5 mr-2" }), "Create with AI"] }) })] })] }) })] }), _jsx("section", { className: "py-8 bg-secondary/50 border-y border-border", children: _jsx("div", { className: "container mx-auto px-4", children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto", children: trustMetrics.map((metric, index) => {
                            const IconComponent = metric.icon;
                            return (_jsxs("div", { className: "text-center", children: [_jsx(IconComponent, { className: "w-8 h-8 mx-auto mb-2 text-muted-foreground" }), _jsx("div", { className: "text-2xl md:text-3xl font-bold text-foreground mb-1", children: metric.value }), _jsx("div", { className: "text-sm text-muted-foreground", children: metric.label })] }, index));
                        }) }) }) }), _jsx("section", { className: "py-16", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10 text-foreground", children: "Daily Featured" }), loading ? (_jsx("div", { className: "max-w-4xl mx-auto h-64 bg-secondary rounded-xl animate-pulse" })) : featuredSkills.length > 0 ? (_jsxs("div", { className: "max-w-4xl mx-auto relative", children: [_jsxs("div", { className: "relative overflow-hidden rounded-xl border border-border bg-card", children: [_jsx("div", { className: "flex transition-transform duration-500 ease-in-out", style: { transform: `translateX(-${currentSlide * 100}%)` }, children: featuredSkills.map((skill) => (_jsx("div", { className: "min-w-full p-8 md:p-12", children: _jsx(Link, { to: `/skills/${skill.id}`, children: _jsxs("div", { className: "cursor-pointer", children: [_jsx("div", { className: "flex items-start gap-4 mb-4", children: _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-2xl md:text-3xl font-bold text-foreground mb-2 hover:text-muted-foreground transition-colors", children: skill.name }), _jsx("p", { className: "text-muted-foreground text-lg mb-4 line-clamp-2", children: skill.description }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { className: "w-4 h-4" }), skill.author] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 fill-yellow-500 text-yellow-500" }), skill.starsCount?.toLocaleString() || 0] }), skill.avgRating && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ThumbsUp, { className: "w-4 h-4", style: { color: '#D4A017', fill: '#D4A017' } }), skill.avgRating.toFixed(1)] }))] })] }) }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { className: "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-200 cursor-pointer", children: "View Details" }) })] }) }) }, skill.id))) }), featuredSkills.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: prevSlide, className: "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary/90 hover:bg-secondary shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 border border-border", "aria-label": "Previous slide", children: _jsx(ChevronLeft, { className: "w-6 h-6 text-foreground" }) }), _jsx("button", { onClick: nextSlide, className: "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary/90 hover:bg-secondary shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 border border-border", "aria-label": "Next slide", children: _jsx(ChevronRight, { className: "w-6 h-6 text-foreground" }) })] }))] }), featuredSkills.length > 1 && (_jsx("div", { className: "flex justify-center gap-2 mt-6", children: featuredSkills.map((_, index) => (_jsx("button", { onClick: () => setCurrentSlide(index), className: `w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${index === currentSlide
                                            ? 'bg-foreground w-8'
                                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`, "aria-label": `Go to slide ${index + 1}` }, index))) }))] })) : null] }) }), _jsx("section", { className: "py-16 bg-secondary/30", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10 text-foreground", children: "Browse by Category" }), _jsxs("div", { className: "flex items-center justify-center gap-4 max-w-6xl mx-auto", children: [_jsx("button", { onClick: () => setCategoryStartIndex((prev) => prev === 0 ? Math.max(0, categories.length - CATEGORIES_PER_PAGE) : prev - CATEGORIES_PER_PAGE), className: "flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border hover:border-foreground/50 hover:bg-secondary flex items-center justify-center transition-all duration-200 cursor-pointer", "aria-label": "Previous categories", children: _jsx(ChevronLeft, { className: "w-5 h-5 text-foreground" }) }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1", children: categories.slice(categoryStartIndex, categoryStartIndex + CATEGORIES_PER_PAGE).map((cat, index) => {
                                        const IconComponent = categoryIcons[cat.category] || Package;
                                        return (_jsx(Link, { to: `/skills?category=${encodeURIComponent(cat.category)}`, children: _jsxs("div", { className: "group p-6 rounded-xl border border-border hover:border-foreground/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center cursor-pointer bg-card h-full", children: [_jsx(IconComponent, { className: "w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all duration-200" }), _jsx("h3", { className: "font-semibold text-foreground mb-1 text-sm capitalize truncate", children: cat.category.replace(/-/g, ' ') }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [cat.count, " skills"] })] }) }, index));
                                    }) }), _jsx("button", { onClick: () => setCategoryStartIndex((prev) => prev + CATEGORIES_PER_PAGE >= categories.length ? 0 : prev + CATEGORIES_PER_PAGE), className: "flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border hover:border-foreground/50 hover:bg-secondary flex items-center justify-center transition-all duration-200 cursor-pointer", "aria-label": "Next categories", children: _jsx(ChevronRight, { className: "w-5 h-5 text-foreground" }) })] }), categories.length > CATEGORIES_PER_PAGE && (_jsx("div", { className: "flex justify-center gap-2 mt-6", children: Array.from({ length: Math.ceil(categories.length / CATEGORIES_PER_PAGE) }).map((_, index) => (_jsx("button", { onClick: () => setCategoryStartIndex(index * CATEGORIES_PER_PAGE), className: `w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${Math.floor(categoryStartIndex / CATEGORIES_PER_PAGE) === index
                                    ? 'bg-foreground w-6'
                                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`, "aria-label": `Go to category page ${index + 1}` }, index))) }))] }) }), _jsx("section", { className: "py-16", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-2", children: "Popular Skills" }), _jsx("p", { className: "text-muted-foreground", children: "Top-rated skills from the community" })] }), _jsx(Link, { to: "/skills", children: _jsx(Button, { variant: "ghost", className: "cursor-pointer hover:bg-secondary", children: "View all \u2192" }) })] }), _jsx(SkillList, { skills: skills, loading: loading, emptyMessage: "No skills available yet", onFavoriteChange: handleFavoriteChange, onRatingChange: handleRatingChange })] }) }), _jsx("section", { className: "py-16 bg-secondary/30", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-4", children: "Why Choose Agent Skills Marketplace?" }), _jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "A trusted platform for Claude skills and agent skills built for the AI coding community" })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto", children: features.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (_jsxs("div", { className: "text-center group", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-border", children: _jsx(IconComponent, { className: "w-8 h-8 text-foreground" }) }), _jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: feature.title }), _jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: feature.description })] }, index));
                            }) })] }) }), _jsx("section", { className: "py-16", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10 text-foreground", children: "Frequently Asked Questions about Claude Skills" }), _jsx("div", { className: "space-y-4", children: faqs.map((faq, index) => (_jsxs("div", { className: "border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-colors duration-200 bg-card", children: [_jsxs("button", { onClick: () => setOpenFaqIndex(openFaqIndex === index ? null : index), className: "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors duration-200 cursor-pointer", children: [_jsx("span", { className: "font-semibold text-foreground pr-4", children: faq.question }), _jsx(ChevronDown, { className: `w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openFaqIndex === index ? 'rotate-180' : ''}` })] }), openFaqIndex === index && (_jsx("div", { className: "px-6 py-4 bg-secondary/30 border-t border-border", children: _jsx("p", { className: "text-muted-foreground leading-relaxed", children: faq.answer }) }))] }, index))) })] }) }) }), _jsx("section", { className: "py-20 bg-secondary/50 border-t border-border", children: _jsxs("div", { className: "container mx-auto px-4 text-center", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4 text-foreground", children: "Ready to Get Started?" }), _jsx("p", { className: "text-lg text-muted-foreground mb-8 max-w-2xl mx-auto", children: "Join thousands of developers extending their AI agents with community-built agent skills" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Link, { to: "/skills", children: _jsx(Button, { size: "lg", className: "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer", children: "Explore Skills" }) }), _jsx(Link, { to: "/create", children: _jsxs(Button, { size: "lg", className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90 hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer", children: [_jsx(Sparkles, { className: "w-5 h-5 mr-2" }), "Create Your Own"] }) })] })] }) })] }));
}
