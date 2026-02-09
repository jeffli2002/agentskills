import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '@/lib/utils';
const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
    return (_jsx("span", { ref: ref, className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors', {
            'bg-primary text-primary-foreground': variant === 'default',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
            'border border-border text-foreground': variant === 'outline',
        }, className), ...props }));
});
Badge.displayName = 'Badge';
export { Badge };
