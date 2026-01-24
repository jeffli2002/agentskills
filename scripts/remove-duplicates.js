/**
 * Remove duplicate skills from scraped data
 * Keeps only skills that are NOT in the existing seed
 */

const fs = require('fs');

// Existing seed repos (to exclude)
const EXISTING_REPOS = [
  'punkpeye/awesome-mcp-servers',
  'modelcontextprotocol/servers',
  'anthropics/claude-code',
  'cline/cline',
  'mem0ai/mem0',
  'hesreallyhim/awesome-claude-code',
  'lastmile-ai/mcp-agent',
  'travisvn/awesome-claude-skills',
  'daymade/claude-code-skills'
];

function main() {
  console.log('Removing duplicates from scraped skills...\n');

  // Read scraped skills
  const scrapedSkills = JSON.parse(fs.readFileSync('./scraped-skills.json', 'utf8'));
  console.log(`Total scraped skills: ${scrapedSkills.length}`);

  // Filter out duplicates
  const uniqueSkills = scrapedSkills.filter(skill => {
    return !EXISTING_REPOS.includes(skill.fullName);
  });

  console.log(`After removing duplicates: ${uniqueSkills.length}`);
  console.log(`Removed: ${scrapedSkills.length - uniqueSkills.length} duplicates\n`);

  // Save to new file
  fs.writeFileSync('./scraped-skills-unique.json', JSON.stringify(uniqueSkills, null, 2));
  console.log('Saved to scraped-skills-unique.json');

  // Show some stats
  console.log('\n=== Stats ===');
  console.log(`Total unique skills: ${uniqueSkills.length}`);
  console.log(`Star range: ${Math.min(...uniqueSkills.map(s => s.starsCount))} - ${Math.max(...uniqueSkills.map(s => s.starsCount))}`);

  // Category breakdown
  const categories = {};
  uniqueSkills.forEach(s => {
    categories[s.category] = (categories[s.category] || 0) + 1;
  });
  console.log('\nCategories:');
  Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

main();
