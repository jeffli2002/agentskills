import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'wouter';
import { LayoutDashboard, Package, Users, LogOut } from 'lucide-react';
const navItems = [
    { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { href: '/admin/skills', label: 'Skills管理', icon: Package },
    { href: '/admin/users', label: '用户管理', icon: Users },
];
export function AdminLayout({ children }) {
    const [location, setLocation] = useLocation();
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setLocation('/admin/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Agent Skills \u540E\u53F0" }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 text-gray-600 hover:text-gray-900", children: [_jsx(LogOut, { className: "h-5 w-5" }), "\u9000\u51FA"] })] }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: children })] }));
}
export default AdminLayout;
