import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const StreamingStepsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Container animation
  const containerScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Step progress animations
  const steps = [
    { name: "Analyzing Requirements", icon: "📋", color: "#4ade80" },
    { name: "Designing Architecture", icon: "🏗️", color: "#60a5fa" },
    { name: "Writing Instructions", icon: "✍️", color: "#f472b6" },
    { name: "Creating Examples", icon: "💡", color: "#fbbf24" },
    { name: "Generating SKILL.md", icon: "📄", color: "#a78bfa" },
  ];

  const getStepProgress = (index: number) => {
    const startFrame = 40 + index * 45;
    const progress = interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
      extrapolateRight: "clamp",
    });
    const checkProgress = interpolate(frame, [startFrame + 20, startFrame + 40], [0, 1], {
      extrapolateRight: "clamp",
    });
    return { progress, checkProgress };
  };

  const getStreamingDots = () => {
    const dotFrame = Math.floor(frame / 8) % 4;
    return ".".repeat(dotFrame);
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      {/* Section Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 8, height: 48, background: "#d4af37", borderRadius: 4 }} />
          <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 48, fontWeight: 600, color: "#ffffff", margin: 0 }}>
            Real-time Generation
          </h2>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 16, marginLeft: 24 }}>
          Watch your skill being created step by step
        </p>
      </div>

      {/* Steps container */}
      <div
        style={{
          width: 800,
          transform: `scale(${Math.min(containerScale, 1)})`,
        }}
      >
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: 24,
            padding: 48,
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
            border: "2px solid rgba(212,175,55,0.2)",
          }}
        >
          {steps.map((step, index) => {
            const { progress, checkProgress } = getStepProgress(index);
            const isActive = frame >= 40 + index * 45 && frame < 40 + (index + 1) * 45;
            const isComplete = checkProgress === 1;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  marginBottom: index < steps.length - 1 ? 28 : 0,
                  opacity: progress,
                  transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
                }}
              >
                {/* Step icon/check */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: isComplete
                      ? step.color
                      : isActive
                      ? `${step.color}25`
                      : "#252540",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: isActive ? `3px solid ${step.color}` : "3px solid transparent",
                    boxShadow: isActive ? `0 0 30px ${step.color}50` : "none",
                    fontSize: 28,
                  }}
                >
                  {isComplete ? (
                    <span style={{ color: "#fff", fontSize: 32 }}>✓</span>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>

                {/* Step name */}
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 24,
                      fontWeight: 500,
                      color: isComplete ? "#fff" : isActive ? step.color : "#888",
                    }}
                  >
                    {step.name}
                    {isActive && !isComplete && (
                      <span style={{ color: step.color }}>{getStreamingDots()}</span>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: 160,
                    height: 8,
                    background: "#252540",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${checkProgress * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${step.color}, ${step.color}80)`,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Overall progress text */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid #2d2d44",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 18,
                color: "#d4af37",
              }}
            >
              Generating your skill{getStreamingDots()}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
