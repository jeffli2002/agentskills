import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TrendingUp, Package, Users, Calendar, LogOut } from 'lucide-react';

interface DashboardData {
  today: {
    newSkills: number;
    newUsers: number;
  };
  total: {
    skills: number;
    users: number;
  };
  trend: {
    skills: { date: string; count: number }[];
    users: { date: string; count: number }[];
  };
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
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
        } else {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const statCards: StatCard[] = [
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5" />
            退出
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Skills 增长趋势（7天）
            </h2>
            <div className="space-y-3">
              {data?.trend.skills && data.trend.skills.length > 0 ? (
                data.trend.skills.map((item) => (
                  <div key={item.date} className="flex justify-between items-center">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-medium">{item.count} 个</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">暂无数据</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              用户增长趋势（7天）
            </h2>
            <div className="space-y-3">
              {data?.trend.users && data.trend.users.length > 0 ? (
                data.trend.users.map((item) => (
                  <div key={item.date} className="flex justify-between items-center">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-medium">{item.count} 人</span>
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

export default AdminDashboardPage;
