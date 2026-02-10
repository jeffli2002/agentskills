import {
  AbsoluteFill,
  Video,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";

export const BrowseVideoScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Ken Burns zoom
  const scale = interpolate(frame, [0, 180], [1, 1.03], {
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
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Video
          src={staticFile("recordings/02-browse-skills.webm")}
          style={{
            width: 1600,
            height: 900,
          }}
        />
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 6, height: 36, background: "#d4af37", borderRadius: 3 }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 600, color: "#fff" }}>
            Browse Skills
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
