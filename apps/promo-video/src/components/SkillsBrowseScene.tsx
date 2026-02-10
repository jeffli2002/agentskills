import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Img,
  staticFile,
} from "remotion";

// Cursor component
const Cursor: React.FC<{ x: number; y: number; clicking?: boolean }> = ({ x, y, clicking }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      zIndex: 100,
      pointerEvents: "none",
    }}
  >
    {/* Cursor pointer */}
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z"
        fill="#fff"
        stroke="#000"
        strokeWidth="1.5"
      />
    </svg>
    {/* Click ripple */}
    {clicking && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #d4af37",
          transform: "translate(-8px, -8px)",
          animation: "none",
          opacity: 0.8,
        }}
      />
    )}
  </div>
);

export const SkillsBrowseScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Screenshot fade in
  const screenshotOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Cursor movement - starts offscreen, moves to first skill card
  const cursorX = interpolate(frame, [20, 80], [1600, 380], {
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [20, 80], [800, 420], {
    extrapolateRight: "clamp",
  });

  // Highlight on skill card
  const highlightOpacity = interpolate(frame, [80, 100, 130, 150], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  // Click effect
  const isClicking = frame >= 120 && frame <= 135;

  // Zoom into the card on click
  const zoomScale = interpolate(frame, [130, 150], [1, 1.15], {
    extrapolateRight: "clamp",
  });
  const zoomX = interpolate(frame, [130, 150], [0, -300], {
    extrapolateRight: "clamp",
  });
  const zoomY = interpolate(frame, [130, 150], [0, -150], {
    extrapolateRight: "clamp",
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
      {/* Screenshot */}
      <div
        style={{
          transform: `scale(${zoomScale}) translate(${zoomX}px, ${zoomY}px)`,
          opacity: screenshotOpacity,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <Img
          src={staticFile("screenshots/04-skills-browse.png")}
          style={{
            width: 1500,
            height: "auto",
            display: "block",
          }}
        />

        {/* Highlight overlay on first skill card */}
        <div
          style={{
            position: "absolute",
            top: 195,
            left: 108,
            width: 280,
            height: 180,
            border: "3px solid #d4af37",
            borderRadius: 12,
            opacity: highlightOpacity,
            boxShadow: "0 0 30px rgba(212,175,55,0.5)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Animated cursor */}
      <Cursor x={cursorX} y={cursorY} clicking={isClicking} />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
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
