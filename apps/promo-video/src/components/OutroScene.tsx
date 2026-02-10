import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo zoom in
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Text animations
  const titleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [30, 60], [30, 0], {
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ctaScale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  // URL fade in
  const urlOpacity = interpolate(frame, [150, 180], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulsing glow effect
  const glowPulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.3, 0.6, 0.3],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,175,55,${glowPulse}) 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 28,
              background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 12px 40px rgba(212,175,55,0.5)",
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#0d0d1a",
                fontFamily: "Inter, sans-serif",
              }}
            >
              AS
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          Start Creating Today
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            opacity: titleOpacity,
            textAlign: "center",
          }}
        >
          Build, Share, and Discover AI Agent Skills
        </p>

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${Math.min(ctaScale, 1)})`,
            marginTop: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
              padding: "24px 64px",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(212,175,55,0.4)",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 28,
                fontWeight: 600,
                color: "#0d0d1a",
              }}
            >
              Get Started Free
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            marginTop: 24,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 32,
              color: "#d4af37",
              letterSpacing: 2,
            }}
          >
            agentskills.cv
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
