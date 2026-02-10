import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');
const BASE_URL = 'https://agentskills.cv';

async function captureScreenshots() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome', // Use system Chrome
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // High DPI for crisp screenshots
  });

  const page = await context.newPage();

  try {
    // 1. Homepage
    console.log('Capturing homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-homepage.png'),
      fullPage: false,
    });

    // 2. Create Skill Page (before input)
    console.log('Capturing create skill page...');
    await page.goto(`${BASE_URL}/create`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-create-skill-empty.png'),
      fullPage: false,
    });

    // 3. Create Skill Page (with input) - try multiple selectors
    console.log('Capturing skill input...');
    try {
      // Try to find any text input area
      const textareaSelectors = [
        'textarea',
        'input[type="text"]',
        '[contenteditable="true"]',
        '.textarea',
        '#skill-input',
      ];

      let inputFound = false;
      for (const selector of textareaSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          await element.fill('Create a skill that converts Word documents to clean Markdown format while preserving formatting and structure');
          inputFound = true;
          console.log(`Found input using selector: ${selector}`);
          break;
        }
      }

      if (!inputFound) {
        console.log('No text input found, taking screenshot anyway');
      }

      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '03-create-skill-input.png'),
        fullPage: false,
      });
    } catch (e) {
      console.log('Error with input, capturing page as-is:', e);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '03-create-skill-input.png'),
        fullPage: false,
      });
    }

    // 4. Skills Browse Page
    console.log('Capturing skills browse...');
    await page.goto(`${BASE_URL}/skills`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-skills-browse.png'),
      fullPage: false,
    });

    // 5. Skill Detail Page - navigate to a specific skill
    console.log('Capturing skill detail...');
    // Click on first skill card if available
    const skillCard = page.locator('a[href^="/skills/"]').first();
    if (await skillCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skillCard.click();
      await page.waitForTimeout(2000);
    } else {
      // Try direct navigation to a known skill
      await page.goto(`${BASE_URL}/skills`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-skill-detail.png'),
      fullPage: false,
    });

    // 6. My Skills page
    console.log('Capturing my skills...');
    await page.goto(`${BASE_URL}/my-skills`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-my-skills.png'),
      fullPage: false,
    });

    console.log('Screenshots captured successfully!');
    console.log(`Saved to: ${SCREENSHOTS_DIR}`);

    // List files
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    console.log('Files:', files);

  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
