import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fast logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  // Title fade
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo */}
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 32 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 12px 48px rgba(212,175,55,0.5)",
          }}
        >
          <span style={{ fontSize: 60, color: "#0d0d1a", fontFamily: "Inter, sans-serif", fontWeight: 700 }}>AS</span>
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 72,
          fontWeight: 700,
          color: "#ffffff",
          margin: 0,
          opacity: titleOpacity,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
      >
        Agent Skills
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 32,
          color: "#d4af37",
          marginTop: 16,
          opacity: taglineOpacity,
          letterSpacing: 2,
        }}
      >
        Marketplace for AI Agent Skills
      </p>
    </AbsoluteFill>
  );
};
