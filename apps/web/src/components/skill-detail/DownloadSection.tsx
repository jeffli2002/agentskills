import { Download, Terminal, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { getDownloadUrl } from '@/lib/api';

interface DownloadSectionProps {
  skillId: string;
  skillName: string;
}

export function DownloadSection({ skillId, skillName }: DownloadSectionProps) {
  const downloadUrl = getDownloadUrl(skillId);

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d2d44]">
        <h3 className="font-semibold text-[#e4e4e7]">Download</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Direct download button */}
        <a
          href={downloadUrl}
          download
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-md transition-colors"
        >
          <Download className="h-4 w-4" />
          Download ZIP
        </a>

        {/* wget command hint */}
        <div className="flex items-start gap-2 text-xs text-zinc-500">
          <Terminal className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <code className="font-mono break-all">
            wget {skillName}.zip
          </code>
        </div>

        {/* Export to OpenClaw */}
        <Link href={`/skills/${skillId}/openclaw`}>
          <span className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#252538] hover:bg-[#2d2d44] text-[#e4e4e7] font-medium rounded-md transition-colors border border-[#2d2d44] cursor-pointer">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 9.5C8 9.5 9.5 8 12 8s4 1.5 4 1.5" />
              <circle cx="9" cy="12" r="1" fill="currentColor" />
              <circle cx="15" cy="12" r="1" fill="currentColor" />
              <path d="M9 15.5s1.5 1.5 3 1.5 3-1.5 3-1.5" />
            </svg>
            Export to OpenClaw
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
