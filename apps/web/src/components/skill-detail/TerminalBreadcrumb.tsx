interface TerminalBreadcrumbProps {
  author: string;
  skillName: string;
}

export function TerminalBreadcrumb({ author, skillName }: TerminalBreadcrumbProps) {
  return (
    <div className="bg-[#1a1a2e] border-b border-[#2d2d44] py-3 px-4">
      <div className="container mx-auto">
        <code className="font-mono text-sm text-[#e4e4e7]">
          <span className="text-emerald-400">$</span>{' '}
          <span className="text-zinc-400">pwd:</span>{' '}
          <span className="text-amber-500">~</span>
          <span className="text-zinc-500"> / </span>
          <span className="text-amber-400">{author}</span>
          <span className="text-zinc-500"> / </span>
          <span className="text-amber-300 font-semibold">{skillName}</span>
        </code>
      </div>
    </div>
  );
}
