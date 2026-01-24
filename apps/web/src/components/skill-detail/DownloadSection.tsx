import { Download, Terminal } from 'lucide-react';
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
      </div>
    </div>
  );
}
