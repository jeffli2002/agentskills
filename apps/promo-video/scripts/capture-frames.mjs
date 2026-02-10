import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const STUDIO_URL = 'http://localhost:3009';
const TOTAL_FRAMES = 1800;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const FRAMES_DIR = 'D:/AI/agentskills/apps/promo-video/out/frames';
const OUTPUT_DIR = 'D:/AI/agentskills/apps/promo-video/out';

async function captureFrames() {
  // Create frames directory
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Use headed mode
    defaultViewport: { width: WIDTH, height: HEIGHT },
    args: [
      '--window-size=1920,1080',
      '--disable-gpu',
      '--no-sandbox',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  console.log('Navigating to Remotion Studio...');

  // Navigate to the composition preview
  // Remotion studio URL format for specific frame
  const baseUrl = `${STUDIO_URL}/preview?id=PromoVideo&time=`;

  console.log(`Capturing ${TOTAL_FRAMES} frames...`);

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const timeInSeconds = frame / FPS;
    const url = `${baseUrl}${timeInSeconds}`;

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait a bit for rendering
    await page.waitForTimeout(100);

    const framePath = path.join(FRAMES_DIR, `frame_${String(frame).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath, type: 'png' });

    if (frame % 30 === 0) {
      console.log(`Captured frame ${frame}/${TOTAL_FRAMES} (${Math.round(frame/TOTAL_FRAMES*100)}%)`);
    }
  }

  console.log('All frames captured!');
  await browser.close();

  console.log('Combining frames into video with ffmpeg...');

  // Combine frames into video
  execSync(`ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -crf 18 "${OUTPUT_DIR}/temp-video.mp4"`, { stdio: 'inherit' });

  console.log('Adding audio...');

  // Add voice and background music
  execSync(`ffmpeg -y -i "${OUTPUT_DIR}/temp-video.mp4" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/01-intro.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/02-hero.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/03-browse.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/04-create.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/05-questions.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/06-workflow.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/07-generate.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/08-publish.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/09-myskills.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/10-outro.mp3" \
    -i "D:/AI/agentskills/apps/promo-video/public/audio/background-music.mp3" \
    -filter_complex "[1:a]adelay=0|0[a1];[2:a]adelay=3000|3000[a2];[3:a]adelay=7000|7000[a3];[4:a]adelay=10000|10000[a4];[5:a]adelay=17000|17000[a5];[6:a]adelay=23000|23000[a6];[7:a]adelay=32000|32000[a7];[8:a]adelay=38000|38000[a8];[9:a]adelay=46000|46000[a9];[10:a]adelay=55000|55000[a10];[a1][a2][a3][a4][a5][a6][a7][a8][a9][a10]amix=inputs=10:duration=longest[voice];[11:a]volume=0.15[music];[voice][music]amix=inputs=2:duration=first[audio]" \
    -map 0:v -map "[audio]" -c:v copy -c:a aac -b:a 192k -ar 44100 -shortest "${OUTPUT_DIR}/promo-video-final.mp4"`, { stdio: 'inherit' });

  console.log('\n✓ Done! Video saved to: out/promo-video-final.mp4');

  // Cleanup
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.unlinkSync(`${OUTPUT_DIR}/temp-video.mp4`);
}

captureFrames().catch(console.error);
