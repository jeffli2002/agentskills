import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '@/lib/utils';
export function Tooltip({ content, children, side = 'top', className }) {
    const [isVisible, setIsVisible] = React.useState(false);
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };
    return (_jsxs("div", { className: "relative inline-block", onMouseEnter: () => setIsVisible(true), onMouseLeave: () => setIsVisible(false), children: [children, isVisible && (_jsx("div", { className: cn('absolute z-50 px-3 py-1.5 text-sm text-popover-foreground bg-popover rounded-md shadow-md border whitespace-nowrap', positionClasses[side], className), children: content }))] }));
}
