import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
export function SearchBar({ value: externalValue, onChange, onSubmit, placeholder = 'Search skills...', className, debounceMs = 300, }) {
    const [internalValue, setInternalValue] = useState(externalValue ?? '');
    // Sync internal value with external value
    useEffect(() => {
        if (externalValue !== undefined) {
            setInternalValue(externalValue);
        }
    }, [externalValue]);
    // Debounced onChange callback
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(internalValue);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [internalValue, debounceMs, onChange]);
    const handleChange = useCallback((e) => {
        setInternalValue(e.target.value);
    }, []);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && onSubmit) {
            onSubmit(internalValue);
        }
    }, [internalValue, onSubmit]);
    return (_jsxs("div", { className: cn('relative', className), children: [_jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx(Input, { type: "search", value: internalValue, onChange: handleChange, onKeyDown: handleKeyDown, placeholder: placeholder, className: "pl-10" })] }));
}
