import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

// Simulated typing effect
const useTypingText = (fullText: string, startFrame: number, charsPerFrame: number = 0.8) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charCount = Math.floor(elapsed * charsPerFrame);
  return fullText.slice(0, Math.min(charCount, fullText.length));
};

export const AIComposerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in the composer interface
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typing animation for the prompt
  const promptText = "Create a skill that helps developers write better git commit messages following conventional commits format";
  const typedText = useTypingText(promptText, 25, 1.2);

  // Show cursor blinking
  const cursorVisible = frame % 30 < 20;

  // Clarifying questions appear after typing
  const question1Opacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateRight: "clamp",
  });
  const question1Y = interpolate(frame, [100, 115], [20, 0], {
    extrapolateRight: "clamp",
  });

  const question2Opacity = interpolate(frame, [120, 135], [0, 1], {
    extrapolateRight: "clamp",
  });
  const question2Y = interpolate(frame, [120, 135], [20, 0], {
    extrapolateRight: "clamp",
  });

  const question3Opacity = interpolate(frame, [140, 155], [0, 1], {
    extrapolateRight: "clamp",
  });
  const question3Y = interpolate(frame, [140, 155], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Selection highlight on first option
  const selectionOpacity = interpolate(frame, [160, 170], [0, 1], {
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
      {/* Composer container */}
      <div
        style={{
          width: 900,
          opacity: containerOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 24, color: "#0d0d1a" }}>AI</span>
          </div>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 600, color: "#fff" }}>
            AI Skill Composer
          </span>
        </div>

        {/* Input area */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
            Describe your skill idea
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: "#fff", lineHeight: 1.5, minHeight: 80 }}>
            {typedText}
            {cursorVisible && typedText.length < promptText.length && (
              <span style={{ color: "#d4af37" }}>|</span>
            )}
          </div>
        </div>

        {/* Clarifying questions */}
        {frame >= 100 && (
          <div
            style={{
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "#d4af37", marginBottom: 20 }}>
              Clarifying Questions
            </div>

            {/* Question 1 */}
            <div
              style={{
                opacity: question1Opacity,
                transform: `translateY(${question1Y}px)`,
                marginBottom: 16,
              }}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "#fff", marginBottom: 8 }}>
                Should it analyze git diff before suggesting?
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: selectionOpacity > 0 ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.1)",
                    border: selectionOpacity > 0 ? "2px solid #d4af37" : "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  Yes, analyze diff
                </div>
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  No, just format
                </div>
              </div>
            </div>

            {/* Question 2 */}
            <div
              style={{
                opacity: question2Opacity,
                transform: `translateY(${question2Y}px)`,
                marginBottom: 16,
              }}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "#fff", marginBottom: 8 }}>
                Include scope suggestions?
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  Yes
                </div>
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  No
                </div>
              </div>
            </div>

            {/* Question 3 */}
            <div
              style={{
                opacity: question3Opacity,
                transform: `translateY(${question3Y}px)`,
              }}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "#fff", marginBottom: 8 }}>
                Target commit style?
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  Conventional
                </div>
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  Gitmoji
                </div>
              </div>
            </div>
          </div>
        )}
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
            Describe Your Skill
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
