import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Edit2, ChevronDown, ChevronUp, ChevronRight, Upload, Globe, Lock, Loader2, FileCode, File } from 'lucide-react';
export function PreviewPanel({ skillMd, onSave, saving, onPublish, publishing, canPublish, isStreaming, resources }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(skillMd);
    const [copied, setCopied] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [selectedVisibility, setSelectedVisibility] = useState('public');
    const [expandedResource, setExpandedResource] = useState(null);
    const contentRef = useRef(null);
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
    return (_jsxs("div", { className: "border-t border-border bg-card/50", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [_jsxs("button", { onClick: () => setCollapsed(!collapsed), className: "flex items-center gap-2 text-sm font-medium text-foreground hover:text-gold transition-colors", children: [collapsed ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })), "SKILL.md Preview", resources && resources.length > 0 && (_jsxs("span", { className: "flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full", children: [_jsx(FileCode, { className: "w-3 h-3" }), "+", resources.length, " files"] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleCopy, className: "text-muted-foreground hover:text-foreground", children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4 mr-1" }), "Copied"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-4 h-4 mr-1" }), "Copy"] })) }), isEditing ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleCancel, children: "Cancel" }), _jsx(Button, { size: "sm", onClick: handleSave, disabled: saving, children: saving ? 'Saving...' : 'Save' })] })) : (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setIsEditing(true), className: "text-muted-foreground hover:text-foreground", children: [_jsx(Edit2, { className: "w-4 h-4 mr-1" }), "Edit"] }))] })] }), !collapsed && (_jsxs("div", { className: "flex flex-col", children: [_jsx("div", { ref: contentRef, className: "p-4 max-h-[300px] overflow-auto", children: isEditing ? (_jsx(Textarea, { value: editedContent, onChange: (e) => setEditedContent(e.target.value), className: "min-h-[250px] font-mono text-sm" })) : (_jsxs("pre", { className: "text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed", children: [skillMd, isStreaming && (_jsx("span", { className: "inline-block w-2 h-4 bg-gold animate-pulse ml-0.5" }))] })) }), resources && resources.length > 0 && (_jsxs("div", { className: "border-t border-border p-4", children: [_jsxs("h3", { className: "text-sm font-medium text-foreground mb-3 flex items-center gap-2", children: [_jsx(FileCode, { className: "w-4 h-4 text-gold" }), "Bundled Resources (", resources.length, " files)"] }), _jsx("div", { className: "space-y-2", children: resources.map((resource) => (_jsxs("div", { className: "border border-border rounded-lg overflow-hidden", children: [_jsxs("button", { onClick: () => setExpandedResource(expandedResource === resource.path ? null : resource.path), className: "w-full flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors text-left", children: [expandedResource === resource.path ? (_jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground" })) : (_jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" })), _jsx(File, { className: "w-4 h-4 text-gold" }), _jsx("span", { className: "text-sm font-mono text-foreground", children: resource.path }), _jsx("span", { className: "text-xs text-muted-foreground ml-auto", children: resource.description })] }), expandedResource === resource.path && (_jsx("div", { className: "border-t border-border bg-muted/30 p-3 max-h-[200px] overflow-auto", children: _jsx("pre", { className: "text-xs font-mono text-muted-foreground whitespace-pre-wrap", children: resource.content }) }))] }, resource.path))) })] })), onPublish && canPublish && (_jsxs("div", { className: "border-t border-border p-4 bg-card/30", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Visibility:" }), _jsxs("div", { className: "flex rounded-lg border border-border overflow-hidden", children: [_jsxs("button", { onClick: () => setSelectedVisibility('public'), className: `flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${selectedVisibility === 'public'
                                                            ? 'bg-gold/20 text-gold border-r border-border'
                                                            : 'text-muted-foreground hover:text-foreground border-r border-border'}`, children: [_jsx(Globe, { className: "w-3.5 h-3.5" }), "Public"] }), _jsxs("button", { onClick: () => setSelectedVisibility('private'), className: `flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${selectedVisibility === 'private'
                                                            ? 'bg-gold/20 text-gold'
                                                            : 'text-muted-foreground hover:text-foreground'}`, children: [_jsx(Lock, { className: "w-3.5 h-3.5" }), "Private"] })] })] }), _jsx(Button, { onClick: () => onPublish(selectedVisibility), disabled: publishing, className: "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold", children: publishing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Publishing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Publish Skill"] })) })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: selectedVisibility === 'public'
                                    ? 'Anyone can discover, view, and download this skill.'
                                    : 'Only you can see and download this skill.' })] }))] }))] }));
}
