#!/bin/bash
# Create 30-second highlight video from Loom recording

INPUT="D:/AI/agentskills/apps/promo-video/public/recordings/source-video.mp4"
OUTPUT_DIR="D:/AI/agentskills/apps/promo-video/public/recordings/segments"
FINAL="D:/AI/agentskills/apps/promo-video/public/recordings/highlight-30s.mp4"

mkdir -p "$OUTPUT_DIR"

# Extract key segments (each ~4-5 seconds)
# Segment 1: Homepage hero (3:35-3:40 = 215-220s) - 5s
ffmpeg -y -ss 215 -i "$INPUT" -t 5 -c:v libx264 -c:a aac "$OUTPUT_DIR/seg1-hero.mp4"

# Segment 2: AI Composer typing (0:35-0:42 = 35-42s) - 7s
ffmpeg -y -ss 35 -i "$INPUT" -t 7 -c:v libx264 -c:a aac "$OUTPUT_DIR/seg2-composer.mp4"

# Segment 3: Quick Questions (1:05-1:12 = 65-72s) - 7s
ffmpeg -y -ss 65 -i "$INPUT" -t 7 -c:v libx264 -c:a aac "$OUTPUT_DIR/seg3-questions.mp4"

# Segment 4: Building workflow (1:35-1:40 = 95-100s) - 5s
ffmpeg -y -ss 95 -i "$INPUT" -t 5 -c:v libx264 -c:a aac "$OUTPUT_DIR/seg4-building.mp4"

# Segment 5: SKILL.md streaming (2:05-2:11 = 125-131s) - 6s
ffmpeg -y -ss 125 -i "$INPUT" -t 6 -c:v libx264 -c:a aac "$OUTPUT_DIR/seg5-skillmd.mp4"

echo "Segments extracted. Creating concat file..."

# Create concat file
cat > "$OUTPUT_DIR/concat.txt" << EOF
file 'seg1-hero.mp4'
file 'seg2-composer.mp4'
file 'seg3-questions.mp4'
file 'seg4-building.mp4'
file 'seg5-skillmd.mp4'
EOF

# Concatenate with crossfade transitions
ffmpeg -y -f concat -safe 0 -i "$OUTPUT_DIR/concat.txt" \
  -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=29.5:d=0.5" \
  -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 128k \
  "$FINAL"

echo "Done! Highlight video created at: $FINAL"
ls -lh "$FINAL"
