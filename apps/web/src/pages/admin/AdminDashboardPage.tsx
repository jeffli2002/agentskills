import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TrendingUp, Package, Users, Calendar, LogOut, ChevronDown } from 'lucide-react';

interface DashboardData {
  period: {
    filter: string;
    start: string;
    end: string;
  };
  stats: {
    newSkills: number;
    newUsers: number;
    totalSkills: number;
    totalUsers: number;
  };
  breakdown: {
    openclawSkills: { new: number; total: number };
    userCreatedSkills: { new: number; total: number };
  };
  trend: {
    skills: { date: string; count: number }[];
    users: { date: string; count: number }[];
  };
}

const timeFilters = [
  { value: 'today', label: '当天' },
  { value: 'yesterday', label: '昨天' },
  { value: '7days', label: '最近7天' },
  { value: '30days', label: '最近30天' },
  { value: 'custom', label: '自定义' },
];

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('today');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [, setLocation] = useLocation();

  const fetchData = async (filterValue: string, start?: string, end?: string) => {
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
      } else {
        setError(result.error || '加载失败');
      }
    } catch {
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

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (newFilter === 'custom') {
      setShowDatePicker(true);
    } else {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => fetchData(filter)} className="mt-4 text-blue-600 hover:underline">
            重试
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { newSkills: 0, newUsers: 0, totalSkills: 0, totalUsers: 0 };
  const breakdown = data?.breakdown || { openclawSkills: { new: 0, total: 0 }, userCreatedSkills: { new: 0, total: 0 } };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            退出
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Time Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeFilters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {showDatePicker && (
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="border rounded px-2 py-1"
              />
              <span className="text-gray-500">至</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="border rounded px-2 py-1"
              />
              <button
                onClick={handleCustomDateApply}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                应用
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="新增 Skills"
            value={stats.newSkills}
            icon={Package}
            color="bg-blue-500"
          />
          <StatCard
            title="总 Skills"
            value={stats.totalSkills}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="新增用户"
            value={stats.newUsers}
            icon={Users}
            color="bg-purple-500"
          />
          <StatCard
            title="总用户"
            value={stats.totalUsers}
            icon={Calendar}
            color="bg-orange-500"
          />
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Skills 分类统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Openclaw 导入 Skills</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">新增</span>
                  <span className="font-semibold">{breakdown.openclawSkills.new}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总计</span>
                  <span className="font-semibold">{breakdown.openclawSkills.total}</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">用户创建 Skills</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">新增</span>
                  <span className="font-semibold">{breakdown.userCreatedSkills.new}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总计</span>
                  <span className="font-semibold">{breakdown.userCreatedSkills.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Skills 趋势 (14天)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data?.trend?.skills?.length > 0 ? (
                data.trend.skills.map((item) => (
                  <div key={item.date} className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">暂无数据</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">用户趋势 (14天)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data?.trend?.users?.length > 0 ? (
                data.trend.users.map((item) => (
                  <div key={item.date} className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">暂无数据</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
