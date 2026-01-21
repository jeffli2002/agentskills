const { chromium } = require('playwright');

async function scrapeGitHubSkills() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Known Claude Code skills repositories to fetch directly
  const knownRepos = [
    'travisvn/awesome-claude-skills',
    'hesreallyhim/awesome-claude-code',
    'daymade/claude-code-skills',
    'levnikolaevich/claude-code-skills',
    'anthropics/claude-code',
    'anthropics/courses',
    'ComposioHQ/awesome-claude-skills',
    'modelcontextprotocol/servers',
    'punkpeye/awesome-mcp-servers',
    'wong2/mcp-servers-list',
    'anthropics/anthropic-cookbook',
    'executeautomation/mcp-playwright',
    'anthropics/prompt-eng-interactive-tutorial',
    'cline/cline',
    'block/goose',
    'eyurtsev/langgraph-mcp-agent',
    'lastmile-ai/mcp-agent',
    'dexaai/dexaai-mcp-server',
    'firebase/firebase-mcp',
    'upstash/mcp',
    'qdrant/mcp-server-qdrant',
    'mem0ai/mem0',
  ];

  const skills = [];

  console.log('Fetching repository details...\n');

  for (const repoPath of knownRepos) {
    try {
      console.log(`  Fetching: ${repoPath}`);
      const url = `https://github.com/${repoPath}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait a bit for dynamic content
      await page.waitForTimeout(1000);

      const details = await page.evaluate(() => {
        // Get repo name from URL
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const owner = pathParts[0];
        const name = pathParts[1];

        // Get description
        const descEl = document.querySelector('p.f4.my-3') ||
                       document.querySelector('[data-testid="about"] p') ||
                       document.querySelector('.BorderGrid-cell p');
        const description = descEl?.textContent?.trim() || '';

        // Get stars - multiple selectors for different GitHub layouts
        let stars = 0;
        const starsEl = document.querySelector('#repo-stars-counter-star') ||
                       document.querySelector('a[href$="/stargazers"] strong') ||
                       document.querySelector('.Counter[id*="star"]');
        if (starsEl) {
          const starsText = starsEl.textContent?.replace(/,/g, '').trim();
          if (starsText) {
            let num = parseFloat(starsText);
            if (starsText.toLowerCase().includes('k')) num *= 1000;
            if (starsText.toLowerCase().includes('m')) num *= 1000000;
            stars = Math.round(num);
          }
        }

        // Get topics
        const topicEls = document.querySelectorAll('a.topic-tag');
        const topics = Array.from(topicEls).map(el => el.textContent?.trim()).filter(Boolean).slice(0, 5);

        // Get primary language
        const langEl = document.querySelector('[data-ga-click*="language"] span') ||
                       document.querySelector('.BorderGrid-cell .color-fg-default');
        const language = langEl?.textContent?.trim() || '';

        return { owner, name, description, stars, topics, language };
      });

      if (details.name && details.owner) {
        skills.push({
          id: `skill-${skills.length + 1}`,
          owner: details.owner,
          name: details.name,
          fullName: `${details.owner}/${details.name}`,
          description: details.description,
          stars: details.stars,
          url: `https://github.com/${details.owner}/${details.name}`,
          topics: details.topics,
          language: details.language
        });
        console.log(`    ✓ ${details.owner}/${details.name} - ${details.stars} stars`);
      }

      await page.waitForTimeout(1500); // Rate limiting

    } catch (error) {
      console.log(`    ✗ Error fetching ${repoPath}: ${error.message}`);
    }
  }

  await browser.close();

  // Filter out any duplicates and sort by stars
  const uniqueSkills = skills
    .filter((skill, index, self) =>
      index === self.findIndex(s => s.fullName === skill.fullName)
    )
    .sort((a, b) => b.stars - a.stars);

  console.log(`\n\nSuccessfully fetched ${uniqueSkills.length} repositories\n`);
  console.log('=== SCRAPED SKILLS DATA ===\n');
  console.log(JSON.stringify(uniqueSkills, null, 2));

  return uniqueSkills;
}

scrapeGitHubSkills().catch(console.error);
