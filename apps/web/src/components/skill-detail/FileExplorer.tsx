import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import type { SkillFile } from '@agentskills/shared';

interface FileExplorerProps {
  files: SkillFile[];
  skillName: string;
}

interface FileNodeProps {
  file: SkillFile;
  depth: number;
  children?: SkillFile[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileNode({ file, depth, children }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isFolder = file.type === 'folder';

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-[#2d2d44]/50 rounded cursor-pointer group ${
          isFolder ? 'font-medium' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isFolder && setIsExpanded(!isExpanded)}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
            )}
            <Folder className="h-4 w-4 text-amber-400 shrink-0" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 text-zinc-400 shrink-0" />
          </>
        )}
        <span className="text-sm text-[#e4e4e7] truncate flex-1">{file.name}</span>
        {!isFolder && (
          <span className="text-xs text-zinc-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatFileSize(file.size)}
          </span>
        )}
      </div>
      {isFolder && isExpanded && children && children.length > 0 && (
        <div>
          {children.map((child, idx) => (
            <FileNode key={`${child.path}-${idx}`} file={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildFileTree(files: SkillFile[]): SkillFile[] {
  // Simple flat rendering for now - files should come pre-structured
  // Sort folders first, then files alphabetically
  return [...files].sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });
}

export function FileExplorer({ files, skillName }: FileExplorerProps) {
  // Hide the component if there are no files
  if (!files || files.length === 0) {
    return null;
  }

  const sortedFiles = buildFileTree(files);
  const totalFiles = files.filter(f => f.type === 'file').length;
  const totalSize = files.reduce((sum, f) => sum + (f.type === 'file' ? f.size : 0), 0);

  return (
    <div className="bg-[#1a1a2e] rounded-lg border border-[#2d2d44] overflow-hidden">
      {/* macOS-style title bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2d2d44] bg-[#252538]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-sm text-zinc-400 font-mono flex-1 text-center">
          {skillName}
        </span>
        <span className="text-xs text-zinc-500">
          {totalFiles} files · {formatFileSize(totalSize)}
        </span>
      </div>

      {/* File tree */}
      <div className="py-2 max-h-80 overflow-y-auto">
        {sortedFiles.map((file, idx) => (
          <FileNode key={`${file.path}-${idx}`} file={file} depth={0} />
        ))}
      </div>
    </div>
  );
}
