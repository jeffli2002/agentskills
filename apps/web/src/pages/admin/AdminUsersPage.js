import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Trash2, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
export function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [, setLocation] = useLocation();
    const token = localStorage.getItem('admin_token');
    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.data);
                setPagination(data.data.pagination);
            }
            else {
                setError(data.error || '加载失败');
            }
        }
        catch {
            setError('加载失败');
        }
        setLoading(false);
    };
    useEffect(() => {
        if (!token) {
            setLocation('/admin/login');
            return;
        }
        fetchUsers(1);
    }, [token, setLocation]);
    const handleDelete = async (id) => {
        if (!confirm('确定要删除这个用户吗？'))
            return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers(pagination.page);
            }
            else {
                alert(data.error || '删除失败');
            }
        }
        catch {
            alert('删除失败');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setLocation('/admin/login');
    };
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setLocation('/admin/dashboard'), className: "text-blue-600 hover:text-blue-800", children: "\u2190 \u8FD4\u56DE\u4EEA\u8868\u76D8" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u7528\u6237\u7BA1\u7406" })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 text-gray-600 hover:text-gray-900", children: [_jsx(LogOut, { className: "h-5 w-5" }), "\u9000\u51FA"] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [error && (_jsx("div", { className: "mb-4 p-4 bg-red-50 text-red-600 rounded-lg", children: error })), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: loading ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "\u52A0\u8F7D\u4E2D..." })) : users.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "\u6682\u65E0\u6570\u636E" })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u7528\u6237" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u90AE\u7BB1" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u521B\u5EFA\u65F6\u95F4" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [user.avatarUrl ? (_jsx("img", { src: user.avatarUrl, alt: user.name, className: "h-10 w-10 rounded-full" })) : (_jsx("div", { className: "h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-gray-400" }) })), _jsx("span", { className: "text-sm font-medium text-gray-900", children: user.name })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: user.email }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(user.createdAt).toLocaleDateString('zh-CN') }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsx("button", { onClick: () => handleDelete(user.id), className: "text-red-600 hover:text-red-900", children: _jsx(Trash2, { className: "h-5 w-5" }) }) })] }, user.id))) })] }), _jsxs("div", { className: "px-6 py-4 flex items-center justify-between border-t border-gray-200", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["\u5171 ", pagination.total, " \u6761\uFF0C\u7B2C ", pagination.page, "/", totalPages, " \u9875"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => fetchUsers(pagination.page - 1), disabled: pagination.page <= 1, className: "p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50", children: _jsx(ChevronLeft, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => fetchUsers(pagination.page + 1), disabled: pagination.page >= totalPages, className: "p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50", children: _jsx(ChevronRight, { className: "h-5 w-5" }) })] })] })] })) })] })] }));
}
export default AdminUsersPage;
