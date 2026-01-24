/**
 * Analyze why repos don't have SKILL.md files
 */

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./skills-with-files-complete.json', 'utf8'));

// Analyze the data
const withSkillMd = data.filter(s => s.hasSkillMd);
const withoutSkillMd = data.filter(s => !s.hasSkillMd);

console.log('=== SKILL.md Analysis ===\n');
console.log('With SKILL.md:', withSkillMd.length);
console.log('Without SKILL.md:', withoutSkillMd.length);

console.log('\n=== Repos WITHOUT SKILL.md (Top 30 by stars) ===\n');
withoutSkillMd
  .sort((a, b) => b.starsCount - a.starsCount)
  .slice(0, 30)
  .forEach(s => {
    const files = Object.keys(s.fetchedFiles || {});
    console.log(`${s.fullName} (${s.starsCount.toLocaleString()} stars)`);
    console.log(`  Files found: ${files.length > 0 ? files.join(', ') : 'none'}`);
    console.log(`  Category: ${s.category}`);
    console.log(`  Topics: ${(s.topics || []).slice(0, 5).join(', ')}`);
    console.log('');
  });

console.log('\n=== Topics Distribution (repos without SKILL.md) ===\n');
const topicCounts = {};
withoutSkillMd.forEach(s => {
  (s.topics || []).forEach(t => {
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  });
});
Object.entries(topicCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([topic, count]) => {
    console.log(`  ${topic}: ${count}`);
  });

console.log('\n=== Key Insight ===\n');
console.log('SKILL.md is a Claude Code / Gemini CLI specific format.');
console.log('Most GitHub repos are general AI/ML tools, NOT Claude Code skills.');
console.log('');
console.log('Repos WITH SKILL.md are typically:');
withSkillMd.slice(0, 10).forEach(s => {
  console.log(`  - ${s.fullName}`);
});
