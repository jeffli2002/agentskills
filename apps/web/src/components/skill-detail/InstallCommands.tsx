import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface InstallCommandsProps {
  author: string;
  skillName: string;
}

type PackageManager = 'npx' | 'bunx' | 'pnpm';

function getCommand(pm: PackageManager, author: string, skillName: string): string {
  const skillPath = `${author}/${skillName}`;
  switch (pm) {
    case 'npx':
      return `npx skills add ${skillPath}`;
    case 'bunx':
      return `bunx skills add ${skillPath}`;
    case 'pnpm':
      return `pnpm dlx skills add ${skillPath}`;
  }
}

export function InstallCommands({ author, skillName }: InstallCommandsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>('npx');
  const [copied, setCopied] = useState(false);

  const command = getCommand(activeTab, author, skillName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied
    }
  };

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d2d44]">
        <h3 className="font-semibold text-[#e4e4e7]">Install</h3>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PackageManager)}>
          <TabsList className="bg-[#252538] w-full">
            <TabsTrigger value="npx" className="flex-1 text-xs">npx</TabsTrigger>
            <TabsTrigger value="bunx" className="flex-1 text-xs">bunx</TabsTrigger>
            <TabsTrigger value="pnpm" className="flex-1 text-xs">pnpm</TabsTrigger>
          </TabsList>

          {(['npx', 'bunx', 'pnpm'] as const).map((pm) => (
            <TabsContent key={pm} value={pm}>
              <div className="mt-3 relative group">
                <div className="bg-[#0d0d1a] rounded-md p-3 pr-10 font-mono text-sm text-emerald-400 overflow-x-auto">
                  <span className="text-zinc-500">$ </span>
                  {getCommand(pm, author, skillName)}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-[#2d2d44] text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label="Copy command"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
