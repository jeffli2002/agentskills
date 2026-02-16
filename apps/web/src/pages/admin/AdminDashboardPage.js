import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TrendingUp, Package, Users, Calendar, LogOut, ChevronDown } from 'lucide-react';
const timeFilters = [
    { value: 'today', label: '当天' },
    { value: 'yesterday', label: '昨天' },
    { value: '7days', label: '最近7天' },
    { value: '30days', label: '最近30天' },
    { value: 'custom', label: '自定义' },
];
export function AdminDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('today');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [, setLocation] = useLocation();
    const fetchData = async (filterValue, start, end) => {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setLocation('/admin/login');
            return;
        }
        let url = `/api/admin/dashboard?filter=${filterValue}`;
        if (filterValue === 'custom' && start && end) {
            url += `&start=${start}&end=${end}`;
        }
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
            else {
                setError(result.error || '加载失败');
            }
        }
        catch {
            setError('加载失败');
        }
        setLoading(false);
    };
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setLocation('/admin/login');
            return;
        }
        fetchData(filter, customRange.start, customRange.end);
    }, [filter, customRange]);
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (newFilter === 'custom') {
            setShowDatePicker(true);
        }
        else {
            setShowDatePicker(false);
        }
    };
    const handleCustomDateApply = () => {
        if (customRange.start && customRange.end) {
            setShowDatePicker(false);
            fetchData('custom', customRange.start, customRange.end);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setLocation('/admin/login');
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "\u52A0\u8F7D\u4E2D..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-red-600", children: error }), _jsx("button", { onClick: () => fetchData(filter), className: "mt-4 text-blue-600 hover:underline", children: "\u91CD\u8BD5" })] }) }));
    }
    const stats = data?.stats || { newSkills: 0, newUsers: 0, totalSkills: 0, totalUsers: 0 };
    const breakdown = data?.breakdown || { openclawSkills: { new: 0, total: 0 }, userCreatedSkills: { new: 0, total: 0 } };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u4EEA\u8868\u76D8" }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 text-gray-600 hover:text-gray-900", children: [_jsx(LogOut, { className: "w-5 h-5" }), "\u9000\u51FA"] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 py-6", children: [_jsxs("div", { className: "mb-6 flex flex-wrap items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("select", { value: filter, onChange: (e) => handleFilterChange(e.target.value), className: "appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500", children: timeFilters.map((f) => (_jsx("option", { value: f.value, children: f.label }, f.value))) }), _jsx(ChevronDown, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" })] }), showDatePicker && (_jsxs("div", { className: "flex items-center gap-2 bg-white p-2 rounded-lg border", children: [_jsx("input", { type: "date", value: customRange.start, onChange: (e) => setCustomRange({ ...customRange, start: e.target.value }), className: "border rounded px-2 py-1" }), _jsx("span", { className: "text-gray-500", children: "\u81F3" }), _jsx("input", { type: "date", value: customRange.end, onChange: (e) => setCustomRange({ ...customRange, end: e.target.value }), className: "border rounded px-2 py-1" }), _jsx("button", { onClick: handleCustomDateApply, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700", children: "\u5E94\u7528" })] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsx(StatCard, { title: "\u65B0\u589E Skills", value: stats.newSkills, icon: Package, color: "bg-blue-500" }), _jsx(StatCard, { title: "\u603B Skills", value: stats.totalSkills, icon: TrendingUp, color: "bg-green-500" }), _jsx(StatCard, { title: "\u65B0\u589E\u7528\u6237", value: stats.newUsers, icon: Users, color: "bg-purple-500" }), _jsx(StatCard, { title: "\u603B\u7528\u6237", value: stats.totalUsers, icon: Calendar, color: "bg-orange-500" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 mb-8", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Skills \u5206\u7C7B\u7EDF\u8BA1" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-gray-700 mb-3", children: "Openclaw \u5BFC\u5165 Skills" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u65B0\u589E" }), _jsx("span", { className: "font-semibold", children: breakdown.openclawSkills.new })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u603B\u8BA1" }), _jsx("span", { className: "font-semibold", children: breakdown.openclawSkills.total })] })] })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-gray-700 mb-3", children: "\u7528\u6237\u521B\u5EFA Skills" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u65B0\u589E" }), _jsx("span", { className: "font-semibold", children: breakdown.userCreatedSkills.new })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u603B\u8BA1" }), _jsx("span", { className: "font-semibold", children: breakdown.userCreatedSkills.total })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Skills \u8D8B\u52BF (14\u5929)" }), _jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: data?.trend?.skills && data.trend.skills.length > 0 ? (data.trend.skills.map((item) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [_jsx("span", { className: "text-gray-600", children: item.date }), _jsx("span", { className: "font-semibold", children: item.count })] }, item.date)))) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "\u6682\u65E0\u6570\u636E" })) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "\u7528\u6237\u8D8B\u52BF (14\u5929)" }), _jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: data?.trend?.users && data.trend.users.length > 0 ? (data.trend.users.map((item) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [_jsx("span", { className: "text-gray-600", children: item.date }), _jsx("span", { className: "font-semibold", children: item.count })] }, item.date)))) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "\u6682\u65E0\u6570\u636E" })) })] })] })] })] }));
}
function StatCard({ title, value, icon: Icon, color }) {
    return (_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `${color} p-3 rounded-lg`, children: _jsx(Icon, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: title }), _jsx("p", { className: "text-2xl font-bold", children: value })] })] }) }));
}
