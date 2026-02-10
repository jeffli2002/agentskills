import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

// Streaming code effect
const useStreamingCode = (lines: string[], startFrame: number, linesPerSecond: number = 2) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - startFrame);
  const lineCount = Math.floor((elapsed / fps) * linesPerSecond);
  return lines.slice(0, Math.min(lineCount, lines.length));
};

export const GenerationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress steps
  const steps = [
    { label: "Analyzing requirements", frame: 0 },
    { label: "Generating skill structure", frame: 30 },
    { label: "Writing SKILL.md", frame: 60 },
    { label: "Creating examples", frame: 90 },
  ];

  // SKILL.md content to stream
  const skillMdLines = [
    "---",
    "name: git-commit-helper",
    "description: Generate conventional commit messages",
    "version: 1.0.0",
    "author: you",
    "---",
    "",
    "# Git Commit Helper",
    "",
    "## When to use",
    "Use this skill when you need to create",
    "commit messages following conventional format.",
    "",
    "## How it works",
    "1. Analyzes your staged changes",
    "2. Identifies the type of change",
    "3. Suggests a conventional commit message",
    "",
    "## Example",
    "```",
    "feat(auth): add OAuth2 login support",
    "```",
  ];

  const streamedLines = useStreamingCode(skillMdLines, 70, 4);

  // Container animations
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Code panel slide in
  const codePanelX = interpolate(frame, [50, 80], [100, 0], {
    extrapolateRight: "clamp",
  });
  const codePanelOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Success checkmark at the end
  const successOpacity = interpolate(frame, [160, 175], [0, 1], {
    extrapolateRight: "clamp",
  });
  const successScale = spring({
    frame: frame - 160,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 48,
          opacity: containerOpacity,
          width: 1400,
        }}
      >
        {/* Left side - Progress steps */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 600, color: "#fff", marginBottom: 32 }}>
            Generating Your Skill
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {steps.map((step, index) => {
              const isActive = frame >= step.frame;
              const isComplete = frame >= step.frame + 25;
              const stepOpacity = interpolate(frame, [step.frame, step.frame + 15], [0, 1], {
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: stepOpacity,
                  }}
                >
                  {/* Step indicator */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: isComplete
                        ? "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)"
                        : isActive
                        ? "rgba(212,175,55,0.3)"
                        : "rgba(255,255,255,0.1)",
                      border: isActive ? "2px solid #d4af37" : "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isComplete ? (
                      <span style={{ color: "#0d0d1a", fontSize: 20 }}>✓</span>
                    ) : (
                      <span style={{ color: "#fff", fontSize: 16 }}>{index + 1}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 20,
                      color: isComplete ? "#d4af37" : isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {step.label}
                  </span>

                  {/* Loading spinner for active step */}
                  {isActive && !isComplete && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#d4af37",
                        transform: `rotate(${(frame * 12) % 360}deg)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Success message */}
          {frame >= 160 && (
            <div
              style={{
                marginTop: 48,
                opacity: successOpacity,
                transform: `scale(${Math.min(successScale, 1)})`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: 28 }}>✓</span>
              </div>
              <div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 24, fontWeight: 600, color: "#22c55e" }}>
                  Skill Created!
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
                  Ready to publish
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side - SKILL.md preview */}
        <div
          style={{
            flex: 1.2,
            transform: `translateX(${codePanelX}px)`,
            opacity: codePanelOpacity,
          }}
        >
          <div
            style={{
              background: "#1e1e2e",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Code editor header */}
            <div
              style={{
                background: "#2d2d3d",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27ca40" }} />
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: "rgba(255,255,255,0.6)", marginLeft: 12 }}>
                SKILL.md
              </span>
            </div>

            {/* Code content */}
            <div style={{ padding: 24, minHeight: 400 }}>
              <pre
                style={{
                  fontFamily: "monospace",
                  fontSize: 14,
                  color: "#fff",
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {streamedLines.map((line, index) => (
                  <div key={index}>
                    {line.startsWith("#") ? (
                      <span style={{ color: "#f4d03f" }}>{line}</span>
                    ) : line.startsWith("---") ? (
                      <span style={{ color: "#888" }}>{line}</span>
                    ) : line.includes(":") && index < 6 ? (
                      <>
                        <span style={{ color: "#9cdcfe" }}>{line.split(":")[0]}:</span>
                        <span style={{ color: "#ce9178" }}>{line.split(":").slice(1).join(":")}</span>
                      </>
                    ) : line.startsWith("```") ? (
                      <span style={{ color: "#888" }}>{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))}
                {frame < 160 && frame % 30 < 20 && (
                  <span style={{ color: "#d4af37" }}>|</span>
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 6, height: 36, background: "#d4af37", borderRadius: 3 }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 600, color: "#fff" }}>
            AI Generation
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
