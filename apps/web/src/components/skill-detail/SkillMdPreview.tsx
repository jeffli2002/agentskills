import Markdown from 'react-markdown';

interface SkillMdPreviewProps {
  metadata: Record<string, string> | null;
  content: string | null;
}

// Fields already displayed elsewhere on the page
const REDUNDANT_FIELDS = ['name', 'description'];

// Parse YAML frontmatter from markdown content
function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = match[1];
  const body = content.slice(match[0].length);
  const frontmatter: Record<string, string> = {};

  // Parse simple YAML key-value pairs
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  });

  return { frontmatter, body };
}

export function SkillMdPreview({ metadata, content }: SkillMdPreviewProps) {
  // Parse metadata if it's a string
  let parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

  // Parse frontmatter from content and get the body
  let markdownContent = content?.trim() || '';

  if (markdownContent) {
    const { frontmatter, body } = parseFrontmatter(markdownContent);
    markdownContent = body.trim();

    // Merge frontmatter into metadata if metadata is empty
    if (!parsedMetadata || Object.keys(parsedMetadata).length === 0) {
      parsedMetadata = frontmatter;
    }
  }

  // Filter out entries with empty values and redundant fields
  const filteredMetadata = parsedMetadata
    ? Object.entries(parsedMetadata).filter(([key, value]) => {
        // Skip redundant fields
        if (REDUNDANT_FIELDS.includes(key.toLowerCase())) return false;
        // Skip empty values
        const strValue = String(value).trim();
        return strValue !== '' && strValue !== 'null' && strValue !== 'undefined';
      })
    : [];

  // Hide the entire card if there's no unique content to show
  if (filteredMetadata.length === 0 && !markdownContent) {
    return null;
  }

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-sm text-zinc-400 font-mono">SKILL.md</span>
      </div>

      {/* Metadata table */}
      {filteredMetadata.length > 0 && (
        <div className="p-4">
          <table className="w-full text-sm">
            <tbody>
              {filteredMetadata.map(([key, value]) => (
                <tr key={key} className="border-b border-[#2d2d44] last:border-0">
                  <td className="py-2 pr-4 text-zinc-500 font-mono whitespace-nowrap align-top">
                    {key}:
                  </td>
                  <td className="py-2 text-[#e4e4e7] font-mono break-words">
                    {String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Markdown content */}
      {markdownContent && (
        <div className="px-4 pb-4">
          <div className="markdown-content text-zinc-300 text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-zinc-100 [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-200 [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:text-zinc-300 [&_a]:text-amber-400 [&_a]:underline [&_code]:text-emerald-400 [&_code]:bg-[#0d0d1a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-[#0d0d1a] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:border [&_pre]:border-[#2d2d44] [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_li]:text-zinc-300 [&_strong]:text-zinc-100 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_hr]:border-[#2d2d44] [&_hr]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#2d2d44] [&_th]:px-3 [&_th]:py-2 [&_th]:bg-[#252538] [&_th]:text-left [&_td]:border [&_td]:border-[#2d2d44] [&_td]:px-3 [&_td]:py-2">
            <Markdown>{markdownContent}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
