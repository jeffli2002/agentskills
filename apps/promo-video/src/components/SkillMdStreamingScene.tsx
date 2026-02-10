import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SkillMdStreamingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // SKILL.md content that will stream in
  const skillMdContent = `---
description: Converts Word documents (.docx) to clean
  Markdown format while preserving formatting,
  headings, and structure.
---

# Word to Markdown Converter

A powerful skill that transforms Microsoft Word
documents into well-formatted Markdown files.

## Features

- Preserves heading hierarchy (H1-H6)
- Converts bold, italic, and underline text
- Handles bullet and numbered lists
- Extracts and links embedded images
- Maintains table structure

## Usage

Simply provide the path to your .docx file:

\`\`\`bash
claude "Convert this document to markdown"
\`\`\`

## Example Output

The skill will generate a .md file with:
- Clean, readable Markdown syntax
- Properly escaped special characters
- Relative image paths`;

  // Calculate how much text to show based on frame
  const totalChars = skillMdContent.length;
  const streamProgress = interpolate(frame, [30, 270], [0, 1], {
    extrapolateRight: "clamp",
  });
  const visibleChars = Math.floor(streamProgress * totalChars);
  const visibleText = skillMdContent.slice(0, visibleChars);

  // Cursor blink effect
  const cursorVisible = Math.floor(frame / 8) % 2 === 0;

  // Zoom into the editor
  const editorScale = interpolate(frame, [0, 60], [0.85, 1], {
    extrapolateRight: "clamp",
  });
  const editorOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Highlight effect on completion
  const completionGlow = interpolate(frame, [270, 300], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Split visible text into lines for syntax highlighting
  const lines = visibleText.split("\n");

  const getSyntaxColor = (line: string): string => {
    if (line.startsWith("---")) return "#d4af37";
    if (line.startsWith("#")) return "#60a5fa";
    if (line.startsWith("-")) return "#4ade80";
    if (line.startsWith("```")) return "#f472b6";
    if (line.includes(":")) return "#fbbf24";
    return "#e4e4e7";
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        background: "transparent",
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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 8,
              height: 48,
              background: "#d4af37",
              borderRadius: 4,
            }}
          />
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 48,
              fontWeight: 600,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Step 3: SKILL.md Streaming
          </h2>
        </div>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            marginTop: 16,
            marginLeft: 24,
          }}
        >
          Your skill definition appears character by character
        </p>
      </div>

      {/* Code editor container */}
      <div
        style={{
          marginTop: 180,
          transform: `scale(${editorScale})`,
          opacity: editorOpacity,
        }}
      >
        {/* Editor window */}
        <div
          style={{
            width: 1100,
            background: "#0d0d1a",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 ${completionGlow * 40}px rgba(212,175,55,${completionGlow * 0.3})`,
            border: `2px solid rgba(212,175,55,${0.2 + completionGlow * 0.3})`,
          }}
        >
          {/* Editor header */}
          <div
            style={{
              background: "#1a1a2e",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid #2d2d44",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                color: "#888",
                marginLeft: 20,
              }}
            >
              SKILL.md
            </span>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#4ade80",
                }}
              >
                {Math.floor(streamProgress * 100)}%
              </span>
            </div>
          </div>

          {/* Editor content */}
          <div
            style={{
              padding: 24,
              fontFamily: "'Fira Code', 'Consolas', monospace",
              fontSize: 16,
              lineHeight: 1.6,
              minHeight: 500,
              maxHeight: 500,
              overflow: "hidden",
            }}
          >
            {lines.map((line, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 24,
                }}
              >
                <span style={{ color: "#444", width: 30, textAlign: "right" }}>
                  {index + 1}
                </span>
                <span style={{ color: getSyntaxColor(line) }}>
                  {line}
                  {index === lines.length - 1 && cursorVisible && streamProgress < 1 && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 20,
                        background: "#d4af37",
                        marginLeft: 2,
                        verticalAlign: "text-bottom",
                      }}
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
