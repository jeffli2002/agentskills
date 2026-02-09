import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '@/lib/utils';
const TabsContext = React.createContext(undefined);
function useTabsContext() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
}
const Tabs = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => (_jsx(TabsContext.Provider, { value: { value, onValueChange }, children: _jsx("div", { ref: ref, className: cn('', className), ...props, children: children }) })));
Tabs.displayName = 'Tabs';
const TabsList = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className), ...props })));
TabsList.displayName = 'TabsList';
const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isSelected = selectedValue === value;
    return (_jsx("button", { ref: ref, type: "button", role: "tab", "aria-selected": isSelected, onClick: () => onValueChange(value), className: cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', isSelected
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:bg-background/50 hover:text-foreground', className), ...props }));
});
TabsTrigger.displayName = 'TabsTrigger';
const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    if (selectedValue !== value) {
        return null;
    }
    return (_jsx("div", { ref: ref, role: "tabpanel", className: cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className), ...props }));
});
TabsContent.displayName = 'TabsContent';
export { Tabs, TabsList, TabsTrigger, TabsContent };
