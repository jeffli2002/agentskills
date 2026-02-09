import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export function CategoryFilter({ categories, selectedCategory, onChange, className, }) {
    return (_jsxs("div", { className: cn('flex flex-wrap gap-2', className), children: [_jsx(Button, { variant: selectedCategory === null ? 'default' : 'outline', size: "sm", onClick: () => onChange(null), className: "rounded-full", children: "All" }), categories.map((category) => (_jsx(Button, { variant: selectedCategory === category ? 'default' : 'outline', size: "sm", onClick: () => onChange(category), className: "rounded-full capitalize", children: category }, category)))] }));
}
