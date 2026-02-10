import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const MySkillsScene: React.FC = () => {
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
  const containerOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Skills data
  const skills = [
    { name: "word-to-md-converter", category: "Productivity", color: "#60a5fa", rating: 4.8, downloads: 127, status: "Published" },
    { name: "api-design-principles", category: "Backend", color: "#4ade80", rating: 4.9, downloads: 342, status: "Published" },
    { name: "git-commit-assistant", category: "DevOps", color: "#a78bfa", rating: 4.7, downloads: 89, status: "Draft" },
  ];

  // Skills appear one by one
  const getSkillAnimation = (index: number) => {
    const startFrame = 60 + index * 35;
    const opacity = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [startFrame, startFrame + 25], [30, 0], {
      extrapolateRight: "clamp",
    });
    return { opacity, y };
  };

  // Stats counter animation
  const statsOpacity = interpolate(frame, [180, 210], [0, 1], {
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
            My Skills Dashboard
          </h2>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 16, marginLeft: 24 }}>
          Manage and track all your published skills
        </p>
      </div>

      {/* Simulated dashboard */}
      <div
        style={{
          width: 1100,
          transform: `scale(${Math.min(containerScale, 1)})`,
          opacity: containerOpacity,
        }}
      >
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
            border: "2px solid rgba(212,175,55,0.2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: "1px solid #2d2d44",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 600, color: "#fff", margin: 0 }}>
                Your Published Skills
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "#888", marginTop: 8 }}>
                {skills.length} skills • 558 total downloads
              </p>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, #d4af37, #f4d03f)",
                padding: "14px 28px",
                borderRadius: 12,
                fontFamily: "Inter, sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#0d0d1a",
                boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
              }}
            >
              + Create New Skill
            </div>
          </div>

          {/* Skills list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {skills.map((skill, index) => {
              const { opacity, y } = getSkillAnimation(index);
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#252540",
                    borderRadius: 16,
                    padding: 24,
                    opacity,
                    transform: `translateY(${y}px)`,
                    border: index === 0 ? "2px solid rgba(212,175,55,0.4)" : "2px solid transparent",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${skill.color}40, ${skill.color}20)`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 24,
                      fontSize: 28,
                    }}
                  >
                    📦
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: "Inter, sans-serif", fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>
                      {skill.name}
                    </h4>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <span
                        style={{
                          background: `${skill.color}25`,
                          color: skill.color,
                          padding: "4px 12px",
                          borderRadius: 6,
                          fontSize: 14,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {skill.category}
                      </span>
                      <span
                        style={{
                          background: skill.status === "Published" ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)",
                          color: skill.status === "Published" ? "#4ade80" : "#fbbf24",
                          padding: "4px 12px",
                          borderRadius: 6,
                          fontSize: 14,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {skill.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#d4af37", fontSize: 22, fontWeight: 600 }}>★ {skill.rating}</div>
                      <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Rating</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#4ade80", fontSize: 22, fontWeight: 600 }}>{skill.downloads}</div>
                      <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Downloads</div>
                    </div>
                    <div
                      style={{
                        background: "#3d3d5c",
                        padding: "10px 20px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 16,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Edit
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 40,
          opacity: statsOpacity,
        }}
      >
        {[
          { label: "Total Skills", value: "3", icon: "📦", color: "#d4af37" },
          { label: "Downloads", value: "558", icon: "⬇️", color: "#4ade80" },
          { label: "Avg Rating", value: "4.8", icon: "⭐", color: "#fbbf24" },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: "rgba(26,26,46,0.95)",
              border: `1px solid ${stat.color}40`,
              borderRadius: 16,
              padding: "20px 32px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 32, fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
