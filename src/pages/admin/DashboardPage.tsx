import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/useAdmin';
import { formatCurrency } from '@/lib/formatters';
import {
  UsersIcon,
  PackageIcon,
  CurrencyDollarIcon,
  TrendUpIcon,
  ChartLineIcon,
  ShoppingBagIcon,
} from '@phosphor-icons/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const summaryCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.totalUsers || 0,
      change: stats?.newUsers || 0,
      changeLabel: 'mới (30 ngày)',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Tổng sản phẩm',
      value: stats?.totalProducts || 0,
      change: stats?.newProducts || 0,
      changeLabel: 'mới (30 ngày)',
      icon: PackageIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Đấu giá đang diễn ra',
      value: stats?.activeAuctions || 0,
      change: stats?.endedAuctions || 0,
      changeLabel: 'đã kết thúc',
      icon: ShoppingBagIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats?.totalRevenue || 0),
      change: `${stats?.pendingSellerRequests || 0} yêu cầu`,
      changeLabel: 'nâng cấp seller',
      icon: CurrencyDollarIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChartLineIcon size={32} weight="duotone" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan thống kê và phân tích hệ thống
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            summaryCards.map((card, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendUpIcon size={14} className="text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          {card.change}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {card.changeLabel}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <card.icon size={24} weight="duotone" className={card.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Người dùng mới (30 ngày)</CardTitle>
              <CardDescription>Số lượng người dùng đăng ký theo ngày</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Người dùng"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Product Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm mới (30 ngày)</CardTitle>
              <CardDescription>Số lượng sản phẩm được đăng theo ngày</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.productGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Sản phẩm"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
              <CardDescription>Tổng doanh thu từ sản phẩm đã bán (6 tháng gần nhất)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.revenueByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Tháng ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố danh mục</CardTitle>
              <CardDescription>Số lượng sản phẩm theo từng danh mục</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats?.categoryDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="count"
                        label={false}
                      >
                        {(stats?.categoryDistribution || []).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} sản phẩm`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Category Table */}
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-2 font-medium">Danh mục</th>
                          <th className="text-right p-2 font-medium">Số lượng</th>
                          <th className="text-right p-2 font-medium">Tỷ lệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(stats?.categoryDistribution || []).map((cat, index) => {
                          const total = (stats?.categoryDistribution || []).reduce(
                            (sum, c) => sum + c.count,
                            0
                          );
                          const percent = ((cat.count / total) * 100).toFixed(1);
                          return (
                            <tr key={index} className="border-t">
                              <td className="p-2 flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-sm"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                {cat.name}
                              </td>
                              <td className="p-2 text-right font-medium">{cat.count}</td>
                              <td className="p-2 text-right text-muted-foreground">
                                {percent}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
