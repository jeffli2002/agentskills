import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";

export const PublishScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Screenshot zoom and pan
  const screenshotOpacity = interpolate(frame, [20, 60], [0, 1], {
    extrapolateRight: "clamp",
  });
  const screenshotScale = interpolate(frame, [20, 80], [0.85, 1], {
    extrapolateRight: "clamp",
  });

  // Ken Burns zoom effect
  const zoomScale = interpolate(frame, [80, 180], [1, 1.15], {
    extrapolateRight: "clamp",
  });
  const zoomY = interpolate(frame, [80, 180], [0, -60], {
    extrapolateRight: "clamp",
  });

  // Success overlay animation
  const successOpacity = interpolate(frame, [180, 210], [0, 1], {
    extrapolateRight: "clamp",
  });
  const successScale = spring({
    frame: frame - 180,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Confetti particles
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const speed = 4 + Math.random() * 4;
    const delay = Math.random() * 15;
    const particleFrame = Math.max(0, frame - 190 - delay);
    return {
      x: Math.cos(angle) * particleFrame * speed,
      y: Math.sin(angle) * particleFrame * speed + particleFrame * 0.3 * (particleFrame * 0.08),
      opacity: interpolate(particleFrame, [0, 20, 50], [0, 1, 0], {
        extrapolateRight: "clamp",
      }),
      color: ["#d4af37", "#4ade80", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa"][i % 6],
      size: 8 + Math.random() * 10,
    };
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%)",
        overflow: "hidden",
      }}
    >
      {/* Section Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          opacity: titleOpacity,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 8, height: 48, background: "#d4af37", borderRadius: 4 }} />
          <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 48, fontWeight: 600, color: "#ffffff", margin: 0 }}>
            Publish & Share
          </h2>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 16, marginLeft: 24 }}>
          Your skill is live on the marketplace
        </p>
      </div>

      {/* Real skill detail screenshot */}
      <div
        style={{
          transform: `scale(${screenshotScale * zoomScale}) translateY(${zoomY}px)`,
          opacity: screenshotOpacity,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
          border: "2px solid rgba(212,175,55,0.3)",
        }}
      >
        <Img
          src={staticFile("screenshots/05-skill-detail.png")}
          style={{
            width: 1300,
            height: "auto",
            display: "block",
          }}
        />
      </div>

      {/* Success overlay */}
      {successOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: successOpacity,
            zIndex: 30,
          }}
        >
          <div
            style={{
              transform: `scale(${Math.min(successScale, 1.1)})`,
              background: "rgba(13,13,26,0.95)",
              borderRadius: 24,
              padding: 48,
              boxShadow: "0 25px 80px rgba(0,0,0,0.8)",
              border: "2px solid rgba(74,222,128,0.4)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                margin: "0 auto 24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 50px rgba(74,222,128,0.6)",
              }}
            >
              <span style={{ fontSize: 52, color: "#fff" }}>✓</span>
            </div>
            <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 36, fontWeight: 600, color: "#4ade80", margin: "0 0 12px 0" }}>
              Published Successfully!
            </h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 20, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              Your skill is now live on the marketplace
            </p>
          </div>

          {/* Confetti */}
          {particles.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                transform: `translate(${p.x}px, ${p.y}px)`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
