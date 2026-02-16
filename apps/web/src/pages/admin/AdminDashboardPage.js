import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TrendingUp, Package, Users, Calendar, LogOut } from 'lucide-react';
export function AdminDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [, setLocation] = useLocation();
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setLocation('/admin/login');
            return;
        }
        fetch('/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                setLocation('/admin/login');
                return null;
            }
            return res.json();
        })
            .then((result) => {
            if (result?.success) {
                setData(result.data);
            }
            else {
                setError(result?.error || '加载失败');
            }
            setLoading(false);
        })
            .catch(() => {
            setError('加载失败');
            setLoading(false);
        });
    }, [setLocation]);
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setLocation('/admin/login');
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-gray-500", children: "\u52A0\u8F7D\u4E2D..." }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-red-500", children: error }) }));
    }
    const statCards = [
        {
            title: '今日新增 Skills',
            value: data?.today.newSkills || 0,
            icon: Package,
            color: 'bg-blue-500',
        },
        {
            title: '今日新增用户',
            value: data?.today.newUsers || 0,
            icon: Users,
            color: 'bg-green-500',
        },
        {
            title: 'Skills 总数',
            value: data?.total.skills || 0,
            icon: TrendingUp,
            color: 'bg-purple-500',
        },
        {
            title: '用户总数',
            value: data?.total.users || 0,
            icon: Calendar,
            color: 'bg-orange-500',
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u4EEA\u8868\u76D8" }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 text-gray-600 hover:text-gray-900", children: [_jsx(LogOut, { className: "h-5 w-5" }), "\u9000\u51FA"] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: statCards.map((card) => (_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: card.title }), _jsx("p", { className: "mt-1 text-3xl font-semibold text-gray-900", children: card.value })] }), _jsx("div", { className: `${card.color} p-3 rounded-lg`, children: _jsx(card.icon, { className: "h-6 w-6 text-white" }) })] }) }, card.title))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Skills \u589E\u957F\u8D8B\u52BF\uFF087\u5929\uFF09" }), _jsx("div", { className: "space-y-3", children: data?.trend.skills && data.trend.skills.length > 0 ? (data.trend.skills.map((item) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600", children: item.date }), _jsxs("span", { className: "font-medium", children: [item.count, " \u4E2A"] })] }, item.date)))) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "\u6682\u65E0\u6570\u636E" })) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\u7528\u6237\u589E\u957F\u8D8B\u52BF\uFF087\u5929\uFF09" }), _jsx("div", { className: "space-y-3", children: data?.trend.users && data.trend.users.length > 0 ? (data.trend.users.map((item) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600", children: item.date }), _jsxs("span", { className: "font-medium", children: [item.count, " \u4EBA"] })] }, item.date)))) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "\u6682\u65E0\u6570\u636E" })) })] })] })] })] }));
}
export default AdminDashboardPage;
