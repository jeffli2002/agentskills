import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
export function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [, setLocation] = useLocation();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || '密码错误');
                setLoading(false);
                return;
            }
            localStorage.setItem('admin_token', data.data.token);
            setLocation('/admin/dashboard');
        }
        catch (err) {
            setError('登录失败，请重试');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx(Lock, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h2", { className: "mt-6 text-3xl font-extrabold text-gray-900", children: "\u7BA1\u7406\u5458\u767B\u5F55" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Agent Skills \u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF" })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsx("div", { className: "rounded-md shadow-sm -space-y-px", children: _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "sr-only", children: "\u7BA1\u7406\u5458\u5BC6\u7801" }), _jsxs("div", { className: "relative", children: [_jsx("input", { id: "password", name: "password", type: showPassword ? 'text' : 'password', autoComplete: "current-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 pr-3 flex items-center", children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5 text-gray-400" })) : (_jsx(Eye, { className: "h-5 w-5 text-gray-400" })) })] })] }) }), error && (_jsxs("div", { className: "flex items-center gap-2 text-red-600 text-sm", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), error] })), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: loading ? '登录中...' : '登录' }) })] })] }) }));
}
export default AdminLoginPage;
