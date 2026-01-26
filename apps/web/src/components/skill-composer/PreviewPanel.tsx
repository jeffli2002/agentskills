import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Edit2, ChevronDown, ChevronUp, ChevronRight, Upload, Globe, Lock, Loader2, FileCode, File } from 'lucide-react';
import type { GeneratedResource } from '@/lib/api';

interface PreviewPanelProps {
  skillMd: string;
  onSave: (skillMd: string) => void;
  saving: boolean;
  onPublish?: (visibility: 'public' | 'private') => void;
  publishing?: boolean;
  canPublish?: boolean;
  isStreaming?: boolean;
  resources?: GeneratedResource[];
}

export function PreviewPanel({ skillMd, onSave, saving, onPublish, publishing, canPublish, isStreaming, resources }: PreviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(skillMd);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'private'>('public');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [skillMd, isStreaming]);

  // Update editedContent when skillMd changes (but not during editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedContent(skillMd);
    }
  }, [skillMd, isEditing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(skillMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(skillMd);
    setIsEditing(false);
  };

  if (!skillMd) {
    return null;
  }

  return (
    <div className="border-t border-border bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold transition-colors"
        >
          {collapsed ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          SKILL.md Preview
          {resources && resources.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full">
              <FileCode className="w-3 h-3" />
              +{resources.length} files
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>

          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex flex-col">
          <div ref={contentRef} className="p-4 max-h-[300px] overflow-auto">
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
              />
            ) : (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {skillMd}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-gold animate-pulse ml-0.5" />
                )}
              </pre>
            )}
          </div>

          {/* Bundled Resources Section */}
          {resources && resources.length > 0 && (
            <div className="border-t border-border p-4">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-gold" />
                Bundled Resources ({resources.length} files)
              </h3>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div key={resource.path} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedResource(expandedResource === resource.path ? null : resource.path)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors text-left"
                    >
                      {expandedResource === resource.path ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <File className="w-4 h-4 text-gold" />
                      <span className="text-sm font-mono text-foreground">{resource.path}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{resource.description}</span>
                    </button>
                    {expandedResource === resource.path && (
                      <div className="border-t border-border bg-muted/30 p-3 max-h-[200px] overflow-auto">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                          {resource.content}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publish section at bottom */}
          {onPublish && canPublish && (
            <div className="border-t border-border p-4 bg-card/30">
              <div className="flex items-center justify-between gap-4">
                {/* Visibility toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Visibility:</span>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setSelectedVisibility('public')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                        selectedVisibility === 'public'
                          ? 'bg-gold/20 text-gold border-r border-border'
                          : 'text-muted-foreground hover:text-foreground border-r border-border'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Public
                    </button>
                    <button
                      onClick={() => setSelectedVisibility('private')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                        selectedVisibility === 'private'
                          ? 'bg-gold/20 text-gold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Private
                    </button>
                  </div>
                </div>

                {/* Publish button */}
                <Button
                  onClick={() => onPublish(selectedVisibility)}
                  disabled={publishing}
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publish Skill
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedVisibility === 'public'
                  ? 'Anyone can discover, view, and download this skill.'
                  : 'Only you can see and download this skill.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
