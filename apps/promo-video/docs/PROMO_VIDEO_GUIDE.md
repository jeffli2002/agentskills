# Promo Video Production Guide

This document describes the process for creating promotional videos using Remotion, including workarounds for network-restricted environments.

## Project Structure

```
apps/promo-video/
├── src/
│   ├── PromoVideo.tsx    # Main video component with all scenes
│   ├── Root.tsx          # Remotion composition definition
│   └── index.ts          # Entry point
├── public/
│   └── audio/            # Voice narration and background music
├── scripts/
│   └── generate-voice.py # Voice generation script using edge-tts
├── out/                  # Rendered output files
└── package.json
```

## Video Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Duration**: 60 seconds (1800 frames)
- **Codec**: H.264 (mp4)

## Scene Structure

| Scene | Start Frame | Duration | Timing |
|-------|-------------|----------|--------|
| Brand Intro | 0 | 90 frames | 0-3s |
| Hero | 90 | 120 frames | 3-7s |
| Browse | 210 | 90 frames | 7-10s |
| Create | 300 | 210 frames | 10-17s |
| Questions | 510 | 180 frames | 17-23s |
| Workflow | 690 | 270 frames | 23-32s |
| Generate | 960 | 180 frames | 32-38s |
| Publish | 1140 | 240 frames | 38-46s |
| My Skills | 1380 | 270 frames | 46-55s |
| Brand Outro | 1650 | 150 frames | 55-60s |

## Development Workflow

### 1. Start Remotion Studio (Preview)

```bash
cd apps/promo-video
pnpm start
# Opens at http://localhost:3000
```

### 2. Generate Voice Narration

Using Microsoft Edge TTS (free, no API key required):

```bash
# Install edge-tts if not installed
pip install edge-tts

# Generate all voice clips
python scripts/generate-voice.py
```

Voice files are saved to `public/audio/` with naming convention `01-intro.mp3`, `02-hero.mp3`, etc.

### 3. Add Background Music

Place royalty-free background music at `public/audio/background-music.mp3`.

Recommended sources:
- Pixabay (free, no attribution required)
- YouTube Audio Library

## Rendering to MP4

### Standard Method (When Network Allows)

```bash
npx remotion render PromoVideo out/promo-video.mp4 --codec h264
```

### Network-Restricted Environment (Chrome Headless Shell Blocked)

When `storage.googleapis.com` is blocked by firewall, Remotion cannot download Chrome Headless Shell. Use this workaround:

#### Step 1: Use Cached Chrome Headless Shell

A cached version is available at:
```
D:/AI/tools/chrome-headless-shell/chrome-headless-shell.exe
```

#### Step 2: Render Silent Video

```bash
cd apps/promo-video
npx remotion render PromoVideo out/silent.mp4 --codec h264 --muted \
  --browser-executable "D:/AI/tools/chrome-headless-shell/chrome-headless-shell.exe"
```

#### Step 3: Add Audio with FFmpeg

```bash
ffmpeg -y -i out/silent.mp4 \
  -i "public/audio/01-intro.mp3" \
  -i "public/audio/02-hero.mp3" \
  -i "public/audio/03-browse.mp3" \
  -i "public/audio/04-create.mp3" \
  -i "public/audio/05-questions.mp3" \
  -i "public/audio/06-workflow.mp3" \
  -i "public/audio/07-generate.mp3" \
  -i "public/audio/08-publish.mp3" \
  -i "public/audio/09-myskills.mp3" \
  -i "public/audio/10-outro.mp3" \
  -i "public/audio/background-music.mp3" \
  -filter_complex "\
    [1:a]adelay=0|0[a1];\
    [2:a]adelay=3000|3000[a2];\
    [3:a]adelay=7000|7000[a3];\
    [4:a]adelay=10000|10000[a4];\
    [5:a]adelay=17000|17000[a5];\
    [6:a]adelay=23000|23000[a6];\
    [7:a]adelay=32000|32000[a7];\
    [8:a]adelay=38000|38000[a8];\
    [9:a]adelay=46000|46000[a9];\
    [10:a]adelay=55000|55000[a10];\
    [a1][a2][a3][a4][a5][a6][a7][a8][a9][a10]amix=inputs=10:duration=longest[voice];\
    [11:a]volume=0.15[music];\
    [voice][music]amix=inputs=2:duration=first[audio]" \
  -map 0:v -map "[audio]" \
  -c:v copy -c:a aac -b:a 192k -ar 44100 \
  -shortest out/promo-video.mp4
```

**FFmpeg Audio Timing Explained:**
- `adelay=X|X` - Delays audio by X milliseconds (left|right channels)
- `amix=inputs=N` - Mixes N audio streams together
- `volume=0.15` - Reduces background music to 15% volume
- `-c:v copy` - Copies video without re-encoding (fast)
- `-shortest` - Ends output when shortest stream ends

## Troubleshooting

### Error: "read ECONNRESET" when rendering

**Cause**: Network firewall blocking `storage.googleapis.com`

**Solution**: Use the cached Chrome Headless Shell as described above.

### Error: "编码不支持" (Encoding not supported) when playing

**Cause**: Video encoded with yuv444p color space (incompatible with many players)

**Solution**: Re-encode with compatible settings:
```bash
ffmpeg -y -i input.mp4 \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -crf 18 \
  -c:a aac -b:a 192k -ar 44100 -ac 2 \
  output-compatible.mp4
```

### Voice clips overlapping

**Cause**: Scene durations shorter than voice clip lengths

**Solution**: Adjust scene durations in `PromoVideo.tsx` to match or exceed voice lengths. Use `ffprobe` to check audio duration:
```bash
ffprobe -i audio.mp3 -show_entries format=duration -v quiet -of csv="p=0"
```

## Chrome Headless Shell Management

### Location
```
D:/AI/tools/chrome-headless-shell/chrome-headless-shell.exe
```

### Manual Download (if needed)
Download from another network:
```
https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.86/win64/chrome-headless-shell-win64.zip
```

Extract and place in `D:/AI/tools/chrome-headless-shell/`

### Finding Cached Versions
```bash
find "$HOME" -name "chrome-headless-shell.exe" 2>/dev/null
```

Common cache locations:
- `~/.cache/puppeteer/chrome-headless-shell/`
- `~/AppData/Local/ms-playwright/chromium_headless_shell-*/`

## Output Files

| File | Description |
|------|-------------|
| `out/silent.mp4` | Video without audio |
| `out/promo-video.mp4` | Final video with voice + music |
