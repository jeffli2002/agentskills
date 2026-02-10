import { chromium, Page } from "playwright";
import path from "path";
import fs from "fs";

const BASE_URL = "https://agentskills.cv";
const OUTPUT_DIR = path.join(__dirname, "../public/recordings");

// Helper to save video after page closes
async function savePageVideo(page: Page, filename: string) {
  const videoPath = await page.video()?.path();
  await page.close();

  // Wait for video to be fully written
  await new Promise(r => setTimeout(r, 1000));

  if (videoPath && fs.existsSync(videoPath)) {
    const destPath = path.join(OUTPUT_DIR, filename);
    // Copy instead of rename to avoid lock issues
    fs.copyFileSync(videoPath, destPath);
    console.log(`  Saved: ${filename}`);
  }
}

async function recordScreens() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Clean up old recordings
  const oldFiles = fs.readdirSync(OUTPUT_DIR);
  for (const f of oldFiles) {
    if (f.endsWith(".webm")) {
      try {
        fs.unlinkSync(path.join(OUTPUT_DIR, f));
      } catch {}
    }
  }

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });

  // Create context with video recording enabled
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  // 1. Landing Page
  console.log("Recording 1: Landing Page...");
  const page1 = await context.newPage();
  await page1.goto(BASE_URL, { waitUntil: "networkidle" });
  await page1.waitForTimeout(2000);

  // Slow scroll down
  await page1.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, 200);
      await new Promise(r => setTimeout(r, 300));
    }
  });
  await page1.waitForTimeout(1000);

  // Scroll back up
  await page1.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page1.waitForTimeout(1500);

  await savePageVideo(page1, "01-landing-page.webm");

  // 2. Browse Skills
  console.log("Recording 2: Browse Skills...");
  const page2 = await context.newPage();
  await page2.goto(`${BASE_URL}/skills`, { waitUntil: "networkidle" });
  await page2.waitForTimeout(2000);

  // Hover over skill cards
  const skillCards = await page2.locator('a[href*="/skills/"]').all();
  if (skillCards.length > 0) {
    await skillCards[0].hover();
    await page2.waitForTimeout(800);
    if (skillCards.length > 1) {
      await skillCards[1].hover();
      await page2.waitForTimeout(800);
    }
    // Click on first skill
    await skillCards[0].click();
    await page2.waitForTimeout(2000);
  }

  await savePageVideo(page2, "02-browse-skills.webm");

  // 3. Skill Creation
  console.log("Recording 3: Skill Creation...");
  const page3 = await context.newPage();
  await page3.goto(`${BASE_URL}/create`, { waitUntil: "networkidle" });
  await page3.waitForTimeout(2000);

  // Find and type in textarea
  const textarea = page3.locator("textarea").first();
  if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    await textarea.click();
    await page3.waitForTimeout(500);

    const text = "Create a skill that helps developers write better git commit messages following conventional commits format";
    await textarea.type(text, { delay: 30 });
    await page3.waitForTimeout(1500);
  } else {
    // Just show what's on the page
    await page3.waitForTimeout(3000);
  }

  await savePageVideo(page3, "03-skill-creation.webm");

  // 4. My Skills / Publishing
  console.log("Recording 4: My Skills...");
  const page4 = await context.newPage();
  await page4.goto(`${BASE_URL}/my-skills`, { waitUntil: "networkidle" });
  await page4.waitForTimeout(3000);

  // Hover over buttons
  const buttons = await page4.locator("button").all();
  for (const btn of buttons.slice(0, 3)) {
    try {
      await btn.hover({ timeout: 1000 });
      await page4.waitForTimeout(500);
    } catch {}
  }

  await page4.waitForTimeout(1500);
  await savePageVideo(page4, "04-my-skills.webm");

  await context.close();
  await browser.close();

  console.log("\nAll recordings saved to:", OUTPUT_DIR);
  console.log("Files:");
  fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith(".webm"))
    .forEach(f => console.log("  -", f));
}

recordScreens().catch(console.error);
