import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
function UserAvatar({ name, avatarUrl }) {
    const [imgError, setImgError] = useState(false);
    // Get initials from name
    const initials = name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    if (!avatarUrl || imgError) {
        return (_jsx("div", { className: "h-8 w-8 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-medium border border-border", children: initials }));
    }
    return (_jsx("img", { src: avatarUrl, alt: name, className: "h-8 w-8 rounded-full", onError: () => setImgError(true) }));
}
export function Header() {
    const { user, loading, login, logout } = useAuth();
    return (_jsx("header", { className: "header-glass sticky top-0 z-50", children: _jsxs("div", { className: "container mx-auto px-4 h-16 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx(Link, { href: "/", className: "text-xl font-bold cursor-pointer hover:opacity-80", children: "Agent Skills" }), _jsxs("nav", { className: "hidden md:flex items-center gap-4", children: [_jsx(Link, { href: "/skills", className: "text-sm text-muted-foreground hover:text-foreground cursor-pointer", children: "Browse" }), _jsx(Link, { href: "/cli", className: "text-sm text-muted-foreground hover:text-foreground cursor-pointer", children: "CLI" }), user && (_jsxs(_Fragment, { children: [_jsx(Link, { href: "/favorites", className: "text-sm text-muted-foreground hover:text-foreground cursor-pointer", children: "Favorites" }), _jsx(Link, { href: "/my-skills", className: "text-sm text-muted-foreground hover:text-foreground cursor-pointer", children: "My Skills" })] }))] })] }), _jsx("div", { className: "flex items-center gap-4", children: loading ? (_jsx("div", { className: "h-10 w-20 bg-muted animate-pulse rounded-md" })) : user ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(UserAvatar, { name: user.name, avatarUrl: user.avatarUrl }), _jsx(Button, { variant: "outline", size: "sm", onClick: logout, children: "Sign Out" })] })) : (_jsx(Button, { variant: "outline", onClick: login, children: "Sign in with Google" })) })] }) }));
}
