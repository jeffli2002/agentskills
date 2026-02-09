import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Redirect } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export function LoginPage() {
    const { user, loading, login } = useAuth();
    // Show loading while checking auth
    if (loading) {
        return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center", children: _jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "h-64 w-96 bg-muted rounded-lg" }) }) }));
    }
    // Redirect to home if already logged in
    if (user) {
        return _jsx(Redirect, { to: "/" });
    }
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx(CardTitle, { className: "text-2xl", children: "Welcome Back" }), _jsx(CardDescription, { children: "Sign in to access your favorites and rate skills" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: login, className: "w-full", size: "lg", children: [_jsxs("svg", { className: "h-5 w-5 mr-2", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Sign in with Google"] }), _jsx("p", { className: "text-xs text-center text-muted-foreground", children: "By signing in, you agree to our Terms of Service and Privacy Policy." })] })] }) }));
}
