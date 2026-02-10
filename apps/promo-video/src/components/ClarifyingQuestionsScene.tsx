import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const ClarifyingQuestionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleX = interpolate(frame, [0, 30], [-100, 0], {
    extrapolateRight: "clamp",
  });

  // Container animation
  const containerScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const containerOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Input text typing effect
  const inputText = "Create a skill that converts Word documents to Markdown format";
  const typedChars = Math.floor(interpolate(frame, [50, 120], [0, inputText.length], {
    extrapolateRight: "clamp",
  }));
  const visibleInput = inputText.slice(0, typedChars);

  // Clarifying questions appear
  const questions = [
    "Should the skill preserve text formatting (bold, italic, headings)?",
    "Do you need to handle embedded images and tables?",
    "Should the output be saved to a file or returned as text?",
  ];

  const getQuestionAnimation = (index: number) => {
    const startFrame = 140 + index * 40;
    const opacity = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
      extrapolateRight: "clamp",
    });
    const x = interpolate(frame, [startFrame, startFrame + 25], [-40, 0], {
      extrapolateRight: "clamp",
    });
    return { opacity, x };
  };

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%)",
        padding: 60,
      }}
    >
      {/* Section Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 8, height: 48, background: "#d4af37", borderRadius: 4 }} />
          <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: 48, fontWeight: 600, color: "#ffffff", margin: 0 }}>
            AI Skill Composer
          </h2>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 16, marginLeft: 24 }}>
          Describe your skill idea and let AI do the rest
        </p>
      </div>

      {/* Simulated Create Skill UI */}
      <div
        style={{
          marginTop: 180,
          width: 1000,
          transform: `scale(${Math.min(containerScale, 1)})`,
          opacity: containerOpacity,
        }}
      >
        {/* Input card */}
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            border: "2px solid rgba(212,175,55,0.3)",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>✨</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "#d4af37", fontWeight: 500 }}>
              Describe your skill
            </span>
          </div>
          <div
            style={{
              background: "#252540",
              borderRadius: 12,
              padding: 20,
              minHeight: 80,
              border: "1px solid #3d3d5c",
            }}
          >
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 20, color: "#fff" }}>
              {visibleInput}
              {frame < 120 && cursorVisible && (
                <span style={{ borderRight: "2px solid #d4af37", marginLeft: 2 }}>&nbsp;</span>
              )}
            </span>
          </div>
        </div>

        {/* AI Clarifying Questions */}
        {frame >= 130 && (
          <div
            style={{
              background: "#1a1a2e",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "2px solid rgba(96,165,250,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 16 }}>🤖</span>
              </div>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "#60a5fa", fontWeight: 500 }}>
                AI is asking clarifying questions...
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {questions.map((q, index) => {
                const { opacity, x } = getQuestionAnimation(index);
                return (
                  <div
                    key={index}
                    style={{
                      background: "#252540",
                      borderRadius: 12,
                      padding: 20,
                      borderLeft: "4px solid #d4af37",
                      opacity,
                      transform: `translateX(${x}px)`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ color: "#d4af37", fontWeight: 600, fontSize: 16 }}>Q{index + 1}</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 18, color: "#fff" }}>{q}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
