import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
  Sequence,
  Audio,
  staticFile,
} from "remotion";

// ============================================
// TIMING CONFIGURATION
// ============================================
const FPS = 30;
const SCENE_DURATION = 90; // 3 seconds per scene

const SCENES = {
  BRAND_INTRO: { start: 0, duration: 90 },           // 3s - voice 2.7s
  HERO: { start: 90, duration: 120 },                // 4s - voice 3.7s
  BROWSE: { start: 210, duration: 90 },              // 3s - voice 2.8s
  CREATE: { start: 300, duration: 210 },             // 7s - voice 6.6s
  QUESTIONS: { start: 510, duration: 180 },          // 6s - voice 5.6s
  WORKFLOW: { start: 690, duration: 270 },           // 9s - voice 8.2s
  GENERATE: { start: 960, duration: 180 },           // 6s - voice 5.8s
  PUBLISH: { start: 1140, duration: 240 },           // 8s - voice 7.2s
  MY_SKILLS: { start: 1380, duration: 270 },         // 9s - voice 8.4s
  BRAND_OUTRO: { start: 1650, duration: 150 },       // 5s - voice 4.8s
};

const TOTAL_FRAMES = 1800; // 60 seconds

// ============================================
// DESIGN TOKENS
// ============================================
const COLORS = {
  bg: "#121418",
  bgLight: "#1F2328",
  surface: "#282D35",
  border: "#353B44",
  gold: "#D4A017",
  goldLight: "#F4C542",
  goldDark: "#A67C00",
  white: "#E4E6EA",
  whiteAlpha: "rgba(228, 230, 234, 0.7)",
};

const FONTS = {
  heading: "Space Grotesk, Inter, sans-serif",
  body: "DM Sans, Inter, sans-serif",
};

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  // Category icons
  brain: (size = 40, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  wrench: (size = 40, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  code: (size = 40, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  server: (size = 40, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
      <line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>
    </svg>
  ),
  barChart: (size = 40, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
    </svg>
  ),
  shield: (size = 40, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  // Workflow icons
  search: (size = 36, color = COLORS.white) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  books: (size = 36, color = COLORS.white) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  ),
  blocks: (size = 36, color = COLORS.white) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  ),
  pen: (size = 36, color = COLORS.white) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  ),
  // Utility icons
  sparkles: (size = 20, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  ),
  cursor: (size = 28, color = COLORS.white) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/>
    </svg>
  ),
  package: (size = 24, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  download: (size = 14, color = COLORS.whiteAlpha) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  ),
  star: (size = 14, color = COLORS.gold) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  check: (size = 64, color = "#121418") => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

// ============================================
// ANIMATION HELPERS
// ============================================
const easeOutCubic = Easing.out(Easing.cubic);
const easeInOutCubic = Easing.inOut(Easing.cubic);

// Scene transition with zoom
const useSceneTransition = (
  frame: number,
  sceneStart: number,
  duration: number
) => {
  const localFrame = frame - sceneStart;

  // Zoom in at start, zoom out at end
  const zoomIn = interpolate(localFrame, [0, 20], [1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const zoomOut = interpolate(localFrame, [duration - 20, duration], [1, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  const fadeIn = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const fadeOut = interpolate(localFrame, [duration - 15, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  return {
    scale: localFrame < duration / 2 ? zoomIn : zoomOut,
    opacity: Math.min(fadeIn, fadeOut),
    localFrame,
  };
};

// Spring animation helper
const useSpringIn = (
  frame: number,
  delay: number,
  fps: number,
  config = { damping: 12, stiffness: 100 }
) => {
  return spring({
    frame: frame - delay,
    fps,
    config,
  });
};

// ============================================
// BACKGROUND COMPONENT
// ============================================
const AnimatedBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const gridOffset = (frame * 0.5) % 60;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Animated grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.border}22 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.border}22 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: `${gridOffset}px ${gridOffset}px`,
          opacity: 0.5,
        }}
      />

      {/* Gold glow orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}15 0%, transparent 60%)`,
          filter: "blur(60px)",
          transform: `translate(${Math.sin(frame * 0.02) * 30}px, ${Math.cos(frame * 0.02) * 30}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.goldLight}10 0%, transparent 60%)`,
          filter: "blur(50px)",
          transform: `translate(${Math.cos(frame * 0.025) * 25}px, ${Math.sin(frame * 0.025) * 25}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 1: BRAND INTRO
// ============================================
const BrandIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = useSpringIn(frame, 10, fps, { damping: 10, stiffness: 80 });
  const textSpring = useSpringIn(frame, 25, fps, { damping: 12, stiffness: 100 });
  const urlSpring = useSpringIn(frame, 40, fps, { damping: 14, stiffness: 90 });

  const glowPulse = 0.4 + Math.sin(frame * 0.1) * 0.2;
  const floatY = Math.sin(frame * 0.05) * 5;

  const fadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeOut,
        }}
      >
        {/* Glow behind logo */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.gold}${Math.floor(glowPulse * 40).toString(16)} 0%, transparent 60%)`,
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
            transform: `translateY(${floatY}px)`,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 50%, ${COLORS.gold} 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 20px 60px ${COLORS.gold}60`,
              transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
              opacity: logoScale,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: COLORS.bg,
                fontFamily: FONTS.heading,
              }}
            >
              AS
            </span>
          </div>

          {/* Brand name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: textSpring,
              transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.heading,
                fontSize: 56,
                fontWeight: 700,
                color: COLORS.white,
              }}
            >
              Agent Skills
            </span>
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 24,
                fontWeight: 400,
                color: COLORS.whiteAlpha,
                letterSpacing: 4,
              }}
            >
              MARKETPLACE
            </span>
          </div>

          {/* URL badge */}
          <div
            style={{
              opacity: urlSpring,
              transform: `translateY(${interpolate(urlSpring, [0, 1], [20, 0])}px)`,
              marginTop: 10,
            }}
          >
            <div
              style={{
                padding: "14px 40px",
                borderRadius: 50,
                border: `2px solid ${COLORS.gold}80`,
                background: `${COLORS.gold}15`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 28,
                  fontWeight: 600,
                  color: COLORS.gold,
                }}
              >
                agentskills.cv
              </span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 2: HERO
// ============================================
const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 120);

  const headlineSpring = useSpringIn(frame, 5, fps);
  const subSpring = useSpringIn(frame, 20, fps);
  const statsSpring = useSpringIn(frame, 35, fps);

  const stats = [
    { value: "1000+", label: "Skills" },
    { value: "5,000+", label: "Users" },
    { value: "50K+", label: "Downloads" },
    { value: "4.8", label: "Rating" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 90} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            maxWidth: 1200,
            textAlign: "center",
          }}
        >
          {/* Headline */}
          <div
            style={{
              opacity: headlineSpring,
              transform: `translateY(${interpolate(headlineSpring, [0, 1], [40, 0])}px)`,
            }}
          >
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 72,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Discover & Create the Best
              <br />
              <span
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight}, ${COLORS.gold})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI Agent Skills
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 28,
              color: COLORS.whiteAlpha,
              margin: 0,
              maxWidth: 800,
              opacity: subSpring,
              transform: `translateY(${interpolate(subSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            Powerful skills for Claude, Codex, and AI assistants.
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 60,
              marginTop: 20,
              opacity: statsSpring,
              transform: `translateY(${interpolate(statsSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 48,
                    fontWeight: 700,
                    color: COLORS.gold,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 18,
                    color: COLORS.whiteAlpha,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 3: BROWSE CATEGORIES
// ============================================
const BrowseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 90);

  const categories = [
    { icon: () => Icons.brain(40, COLORS.gold), name: "AI & ML", count: 156 },
    { icon: () => Icons.barChart(40, COLORS.gold), name: "Analytics", count: 124 },
    { icon: () => Icons.wrench(40, COLORS.gold), name: "Automation", count: 89 },
    { icon: () => Icons.code(40, COLORS.gold), name: "Development", count: 98 },
    { icon: () => Icons.server(40, COLORS.gold), name: "Productivity", count: 112 },
    { icon: () => Icons.shield(40, COLORS.gold), name: "Business", count: 67 },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 180} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 50,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: useSpringIn(frame, 5, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 5, fps), [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 52,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
              }}
            >
              Browse by Category
            </h2>
          </div>

          {/* Category Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {categories.map((cat, i) => {
              const delay = 15 + i * 8;
              const cardSpring = useSpringIn(frame, delay, fps, { damping: 14, stiffness: 120 });
              const isHovered = frame > 50 && frame < 70 && i === 2;

              return (
                <div
                  key={i}
                  style={{
                    width: 220,
                    padding: "30px 24px",
                    background: isHovered ? COLORS.surface : COLORS.bgLight,
                    borderRadius: 16,
                    border: `1px solid ${isHovered ? COLORS.gold : COLORS.border}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    opacity: cardSpring,
                    transform: `
                      translateY(${interpolate(cardSpring, [0, 1], [40, 0])}px)
                      scale(${isHovered ? 1.05 : 1})
                    `,
                    boxShadow: isHovered ? `0 10px 40px ${COLORS.gold}30` : "none",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div style={{ width: 40, height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {cat.icon()}
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 20,
                      fontWeight: 600,
                      color: COLORS.white,
                    }}
                  >
                    {cat.name}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 14,
                      color: COLORS.whiteAlpha,
                    }}
                  >
                    {cat.count} skills
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 4: CREATE WITH AI
// ============================================
const CreateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 210);

  const titleSpring = useSpringIn(frame, 5, fps);
  const inputSpring = useSpringIn(frame, 20, fps);
  const buttonSpring = useSpringIn(frame, 40, fps);

  // Typing animation
  const fullText = "Create a skill that generates weekly sales reports...";
  const typedLength = Math.min(
    Math.floor(interpolate(frame, [25, 70], [0, fullText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })),
    fullText.length
  );
  const typedText = fullText.slice(0, typedLength);
  const showCursor = frame % 20 < 10;

  // Click effect timing - happens near end of scene for natural transition
  const clickFrame = 180;
  const isClicking = frame >= clickFrame;
  const clickProgress = interpolate(frame, [clickFrame, clickFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  // Bubble ripple effect
  const rippleScale = interpolate(frame, [clickFrame, clickFrame + 20], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const rippleOpacity = interpolate(frame, [clickFrame, clickFrame + 20], [0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Second ripple (delayed)
  const ripple2Scale = interpolate(frame, [clickFrame + 5, clickFrame + 25], [0, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const ripple2Opacity = interpolate(frame, [clickFrame + 5, clickFrame + 25], [0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Button press effect
  const buttonScale = isClicking
    ? interpolate(frame, [clickFrame, clickFrame + 4, clickFrame + 8], [1, 0.95, 1.08], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeOutCubic,
      })
    : 1;

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 270} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Badge */}
          <div
            style={{
              opacity: titleSpring,
              transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                padding: "10px 24px",
                background: `${COLORS.gold}20`,
                borderRadius: 30,
                border: `1px solid ${COLORS.gold}50`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 16,
                  fontWeight: 500,
                  color: COLORS.gold,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {Icons.sparkles(16, COLORS.gold)}
                AI Skill Composer
              </span>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              opacity: titleSpring,
              transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 56,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
                textAlign: "center",
              }}
            >
              Create Skills with
              <span
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginLeft: 16,
                }}
              >
                AI
              </span>
            </h2>
          </div>

          {/* Input Box */}
          <div
            style={{
              width: 700,
              opacity: inputSpring,
              transform: `translateY(${interpolate(inputSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                background: COLORS.bgLight,
                borderRadius: 16,
                border: `2px solid ${COLORS.border}`,
                padding: "24px 28px",
                minHeight: 120,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  color: typedLength > 0 ? COLORS.white : COLORS.whiteAlpha,
                }}
              >
                {typedText}
                {showCursor && (
                  <span style={{ color: COLORS.gold }}>|</span>
                )}
              </span>
            </div>
          </div>

          {/* Generate Button with bubble effect */}
          <div
            style={{
              opacity: buttonSpring,
              transform: `translateY(${interpolate(buttonSpring, [0, 1], [20, 0])}px)`,
              position: "relative",
            }}
          >
            {/* Ripple effects */}
            {isClicking && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${COLORS.goldLight} 0%, transparent 70%)`,
                    transform: `translate(-50%, -50%) scale(${rippleScale})`,
                    opacity: rippleOpacity,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: `3px solid ${COLORS.gold}`,
                    transform: `translate(-50%, -50%) scale(${ripple2Scale})`,
                    opacity: ripple2Opacity,
                    pointerEvents: "none",
                  }}
                />
              </>
            )}

            {/* Cursor pointer indicator */}
            {frame >= 160 && frame < clickFrame && (
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  bottom: -15,
                  transform: `translate(${Math.sin(frame * 0.3) * 3}px, ${Math.cos(frame * 0.3) * 3}px)`,
                }}
              >
                {Icons.cursor(28, COLORS.white)}
              </div>
            )}

            <div
              style={{
                padding: "18px 48px",
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                borderRadius: 12,
                boxShadow: isClicking
                  ? `0 12px 40px ${COLORS.gold}70`
                  : `0 8px 32px ${COLORS.gold}50`,
                transform: `scale(${buttonScale})`,
                transition: "box-shadow 0.1s",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.bg,
                }}
              >
                Generate Skill
              </span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 5: CLARIFYING QUESTIONS
// ============================================
const QuestionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 180);

  const questions = [
    { q: "What data sources should it use?", options: ["CRM", "Spreadsheets", "Database"] },
    { q: "Include visualization charts?", options: ["Yes", "No"] },
    { q: "Report format?", options: ["PDF", "Email", "Dashboard"] },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 360} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: useSpringIn(frame, 5, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 5, fps), [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
              }}
            >
              AI Asks Clarifying Questions
            </h2>
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 600 }}>
            {questions.map((item, i) => {
              const delay = 15 + i * 20;
              const qSpring = useSpringIn(frame, delay, fps);
              const selectedIndex = frame > delay + 30 ? (i === 0 ? 2 : i === 1 ? 0 : 2) : -1;

              return (
                <div
                  key={i}
                  style={{
                    background: COLORS.bgLight,
                    borderRadius: 16,
                    border: `1px solid ${COLORS.border}`,
                    padding: 24,
                    opacity: qSpring,
                    transform: `translateX(${interpolate(qSpring, [0, 1], [-50, 0])}px)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.heading,
                          fontSize: 14,
                          fontWeight: 700,
                          color: COLORS.bg,
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 18,
                        color: COLORS.white,
                      }}
                    >
                      {item.q}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {item.options.map((opt, j) => (
                      <div
                        key={j}
                        style={{
                          padding: "10px 20px",
                          borderRadius: 8,
                          background: selectedIndex === j ? COLORS.gold : COLORS.surface,
                          border: `1px solid ${selectedIndex === j ? COLORS.gold : COLORS.border}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONTS.body,
                            fontSize: 14,
                            color: selectedIndex === j ? COLORS.bg : COLORS.white,
                            fontWeight: selectedIndex === j ? 600 : 400,
                          }}
                        >
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 6: WORKFLOW VISUALIZATION
// ============================================
const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 270);

  const steps = [
    { title: "Analyze Request", icon: (color: string) => Icons.search(36, color) },
    { title: "Search Similar Skills", icon: (color: string) => Icons.books(36, color) },
    { title: "Build Structure", icon: (color: string) => Icons.blocks(36, color) },
    { title: "Generate Content", icon: (color: string) => Icons.pen(36, color) },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 450} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 50,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: useSpringIn(frame, 5, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 5, fps), [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
              }}
            >
              Intelligent Workflow
            </h2>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            {steps.map((step, i) => {
              const delay = 20 + i * 28;  // More spacing between steps
              const stepSpring = useSpringIn(frame, delay, fps);
              const isActive = frame > delay + 15;
              const isComplete = frame > delay + 35;

              return (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 180,
                      padding: 24,
                      background: isActive ? COLORS.surface : COLORS.bgLight,
                      borderRadius: 16,
                      border: `2px solid ${isComplete ? COLORS.gold : isActive ? COLORS.gold + "60" : COLORS.border}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      opacity: stepSpring,
                      transform: `
                        scale(${interpolate(stepSpring, [0, 1], [0.8, 1])})
                        ${isActive && !isComplete ? `translateY(${Math.sin(frame * 0.15) * 3}px)` : ""}
                      `,
                      boxShadow: isComplete ? `0 8px 32px ${COLORS.gold}30` : "none",
                    }}
                  >
                    <div style={{ width: 36, height: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {step.icon(isComplete ? COLORS.gold : COLORS.white)}
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 14,
                        fontWeight: 500,
                        color: isComplete ? COLORS.gold : COLORS.white,
                        textAlign: "center",
                      }}
                    >
                      {step.title}
                    </span>
                    {isComplete && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          background: COLORS.gold,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {Icons.check(14, COLORS.bg)}
                      </div>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        width: 40,
                        height: 3,
                        background: isComplete ? COLORS.gold : COLORS.border,
                        marginLeft: 10,
                        marginRight: 10,
                        opacity: stepSpring,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 7: GENERATE SKILL.MD
// ============================================
const GenerateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 180);

  const codeLines = [
    "---",
    "name: sales-report-generator",
    "description: Generate weekly sales reports",
    "author: you",
    "version: 1.0.0",
    "---",
    "",
    "# Sales Report Generator",
    "",
    "Automate your weekly reports...",
  ];

  const visibleLines = Math.floor(
    interpolate(frame, [15, 70], [0, codeLines.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 540} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: useSpringIn(frame, 5, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 5, fps), [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
              }}
            >
              Generating{" "}
              <span style={{ color: COLORS.gold }}>SKILL.md</span>
            </h2>
          </div>

          {/* Code Preview */}
          <div
            style={{
              width: 700,
              background: COLORS.bgLight,
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
              overflow: "hidden",
              opacity: useSpringIn(frame, 10, fps),
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 20px",
                background: COLORS.surface,
                borderBottom: `1px solid ${COLORS.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#febc2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#28c840" }} />
              <span
                style={{
                  marginLeft: 12,
                  fontFamily: FONTS.body,
                  fontSize: 14,
                  color: COLORS.whiteAlpha,
                }}
              >
                SKILL.md
              </span>
            </div>

            {/* Code content */}
            <div style={{ padding: 20, fontFamily: "monospace", fontSize: 16 }}>
              {codeLines.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  style={{
                    color: line.startsWith("---")
                      ? COLORS.gold
                      : line.startsWith("#")
                      ? COLORS.goldLight
                      : line.includes(":")
                      ? COLORS.white
                      : COLORS.whiteAlpha,
                    height: 24,
                  }}
                >
                  {line || " "}
                </div>
              ))}
              {visibleLines < codeLines.length && frame % 15 < 8 && (
                <span style={{ color: COLORS.gold }}>▊</span>
              )}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 8: PUBLISH
// ============================================
const PublishScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 240);

  const checkSpring = useSpringIn(frame, 5, fps, { damping: 8, stiffness: 100 });
  const successPulse = frame > 20 ? 1 + Math.sin((frame - 20) * 0.2) * 0.05 : 1;

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 690} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Success Icon */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 20px 60px ${COLORS.gold}50`,
              transform: `scale(${interpolate(checkSpring, [0, 1], [0, 1]) * successPulse})`,
              opacity: checkSpring,
            }}
          >
            {Icons.check(64, COLORS.bg)}
          </div>

          {/* Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: useSpringIn(frame, 20, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 20, fps), [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 52,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
              }}
            >
              Skill Published!
            </h2>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: 24,
                color: COLORS.whiteAlpha,
                margin: 0,
              }}
            >
              Your skill is now live on the marketplace
            </p>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 20,
              opacity: useSpringIn(frame, 35, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 35, fps), [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                padding: "14px 32px",
                background: COLORS.gold,
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.bg,
                }}
              >
                View Skill
              </span>
            </div>
            <div
              style={{
                padding: "14px 32px",
                background: "transparent",
                borderRadius: 10,
                border: `2px solid ${COLORS.border}`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.white,
                }}
              >
                Download ZIP
              </span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 9: MY SKILLS
// ============================================
const MySkillsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale, opacity } = useSceneTransition(frame, 0, 270);

  const skills = [
    { name: "sales-report-generator", downloads: 1234, rating: 4.9 },
    { name: "email-campaign-builder", downloads: 892, rating: 4.7 },
    { name: "meeting-notes-summary", downloads: 567, rating: 4.8 },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 720} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: useSpringIn(frame, 5, fps),
              transform: `translateY(${interpolate(useSpringIn(frame, 5, fps), [0, 1], [30, 0])}px)`,
            }}
          >
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.white,
                margin: 0,
              }}
            >
              Your Skill Collection
            </h2>
          </div>

          {/* Skills Grid */}
          <div style={{ display: "flex", gap: 24 }}>
            {skills.map((skill, i) => {
              const delay = 15 + i * 12;
              const cardSpring = useSpringIn(frame, delay, fps);

              return (
                <div
                  key={i}
                  style={{
                    width: 280,
                    background: COLORS.bgLight,
                    borderRadius: 16,
                    border: `1px solid ${COLORS.border}`,
                    padding: 24,
                    opacity: cardSpring,
                    transform: `
                      translateY(${interpolate(cardSpring, [0, 1], [40, 0])}px)
                      scale(${interpolate(cardSpring, [0, 1], [0.9, 1])})
                    `,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${COLORS.gold}30, ${COLORS.goldLight}20)`,
                      border: `1px solid ${COLORS.gold}40`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    {Icons.package(24, COLORS.gold)}
                  </div>
                  <h3
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 18,
                      fontWeight: 600,
                      color: COLORS.white,
                      margin: "0 0 8px 0",
                    }}
                  >
                    {skill.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 12,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 14,
                        color: COLORS.whiteAlpha,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {Icons.download(14, COLORS.whiteAlpha)}
                      {skill.downloads}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 14,
                        color: COLORS.gold,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {Icons.star(14, COLORS.gold)}
                      {skill.rating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 10: BRAND OUTRO
// ============================================
const BrandOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = useSpringIn(frame, 5, fps, { damping: 10, stiffness: 80 });
  const textSpring = useSpringIn(frame, 20, fps);
  const urlSpring = useSpringIn(frame, 35, fps);
  const ctaSpring = useSpringIn(frame, 50, fps);

  const glowPulse = 0.5 + Math.sin(frame * 0.08) * 0.2;
  const floatY = Math.sin(frame * 0.04) * 4;

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame + 810} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Large glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.gold}${Math.floor(glowPulse * 30).toString(16)} 0%, transparent 60%)`,
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
            transform: `translateY(${floatY}px)`,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 50%, ${COLORS.gold} 100%)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 20px 60px ${COLORS.gold}60`,
              transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
              opacity: logoScale,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: COLORS.bg,
                fontFamily: FONTS.heading,
              }}
            >
              AS
            </span>
          </div>

          {/* Brand name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: textSpring,
              transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.heading,
                fontSize: 52,
                fontWeight: 700,
                color: COLORS.white,
              }}
            >
              Agent Skills
            </span>
          </div>

          {/* URL */}
          <div
            style={{
              opacity: urlSpring,
              transform: `translateY(${interpolate(urlSpring, [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                padding: "16px 48px",
                borderRadius: 50,
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                boxShadow: `0 10px 40px ${COLORS.gold}50`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 32,
                  fontWeight: 700,
                  color: COLORS.bg,
                }}
              >
                agentskills.cv
              </span>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 20,
              opacity: ctaSpring,
              transform: `translateY(${interpolate(ctaSpring, [0, 1], [20, 0])}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 24,
                color: COLORS.whiteAlpha,
              }}
            >
              Start building your skills today
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const PromoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Background Music - lower volume, plays throughout */}
      <Audio
        src={staticFile("audio/background-music.mp3")}
        volume={0.12}
      />

      {/* Voice narrations - each trimmed to scene duration */}
      <Sequence from={SCENES.BRAND_INTRO.start} durationInFrames={SCENES.BRAND_INTRO.duration}>
        <Audio src={staticFile("audio/01-intro.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.HERO.start} durationInFrames={SCENES.HERO.duration}>
        <Audio src={staticFile("audio/02-hero.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.BROWSE.start} durationInFrames={SCENES.BROWSE.duration}>
        <Audio src={staticFile("audio/03-browse.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.CREATE.start} durationInFrames={SCENES.CREATE.duration}>
        <Audio src={staticFile("audio/04-create.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.QUESTIONS.start} durationInFrames={SCENES.QUESTIONS.duration}>
        <Audio src={staticFile("audio/05-questions.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.WORKFLOW.start} durationInFrames={SCENES.WORKFLOW.duration}>
        <Audio src={staticFile("audio/06-workflow.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.GENERATE.start} durationInFrames={SCENES.GENERATE.duration}>
        <Audio src={staticFile("audio/07-generate.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.PUBLISH.start} durationInFrames={SCENES.PUBLISH.duration}>
        <Audio src={staticFile("audio/08-publish.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.MY_SKILLS.start} durationInFrames={SCENES.MY_SKILLS.duration}>
        <Audio src={staticFile("audio/09-myskills.mp3")} volume={0.9} />
      </Sequence>

      <Sequence from={SCENES.BRAND_OUTRO.start} durationInFrames={SCENES.BRAND_OUTRO.duration}>
        <Audio src={staticFile("audio/10-outro.mp3")} volume={0.9} />
      </Sequence>

      {/* Visual scenes */}
      <Sequence from={SCENES.BRAND_INTRO.start} durationInFrames={SCENES.BRAND_INTRO.duration}>
        <BrandIntroScene />
      </Sequence>

      <Sequence from={SCENES.HERO.start} durationInFrames={SCENES.HERO.duration}>
        <HeroScene />
      </Sequence>

      <Sequence from={SCENES.BROWSE.start} durationInFrames={SCENES.BROWSE.duration}>
        <BrowseScene />
      </Sequence>

      <Sequence from={SCENES.CREATE.start} durationInFrames={SCENES.CREATE.duration}>
        <CreateScene />
      </Sequence>

      <Sequence from={SCENES.QUESTIONS.start} durationInFrames={SCENES.QUESTIONS.duration}>
        <QuestionsScene />
      </Sequence>

      <Sequence from={SCENES.WORKFLOW.start} durationInFrames={SCENES.WORKFLOW.duration}>
        <WorkflowScene />
      </Sequence>

      <Sequence from={SCENES.GENERATE.start} durationInFrames={SCENES.GENERATE.duration}>
        <GenerateScene />
      </Sequence>

      <Sequence from={SCENES.PUBLISH.start} durationInFrames={SCENES.PUBLISH.duration}>
        <PublishScene />
      </Sequence>

      <Sequence from={SCENES.MY_SKILLS.start} durationInFrames={SCENES.MY_SKILLS.duration}>
        <MySkillsScene />
      </Sequence>

      <Sequence from={SCENES.BRAND_OUTRO.start} durationInFrames={SCENES.BRAND_OUTRO.duration}>
        <BrandOutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
