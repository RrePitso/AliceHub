import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import type { Order, User } from "@shared/schema";

type PlatformStats = {
  totalOrders: number;
  totalRevenue: number;
  activeVendors: number;
  activeDrivers: number;
};

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery<PlatformStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentOrders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-800";
      case "picked_up": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
          <p className="text-slate-600">Manage users, orders, and monitor platform performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-shopping-cart text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : stats?.totalOrders || 0}
                  </h3>
                  <p className="text-slate-600 text-sm">Total Orders</p>
                  <p className="text-emerald-600 text-xs">+12% from last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-dollar-sign text-emerald-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
                  </h3>
                  <p className="text-slate-600 text-sm">Revenue</p>
                  <p className="text-emerald-600 text-xs">+8% from last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-store text-purple-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : stats?.activeVendors || 0}
                  </h3>
                  <p className="text-slate-600 text-sm">Active Vendors</p>
                  <p className="text-emerald-600 text-xs">+3 new this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-motorcycle text-orange-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loadingStats ? "..." : stats?.activeDrivers || 0}
                  </h3>
                  <p className="text-slate-600 text-sm">Active Drivers</p>
                  <p className="text-red-600 text-xs">-2 from last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Orders</CardTitle>
                  <Select defaultValue="24h">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-slate-200 rounded h-12 animate-pulse"></div>
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-clipboard text-4xl text-slate-400 mb-4"></i>
                    <h4 className="font-medium text-slate-900 mb-2">No recent orders</h4>
                    <p className="text-slate-600">Orders will appear here as they come in.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 text-slate-600 font-medium">Order ID</th>
                          <th className="text-left py-3 text-slate-600 font-medium">Customer</th>
                          <th className="text-left py-3 text-slate-600 font-medium">Status</th>
                          <th className="text-left py-3 text-slate-600 font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="border-b border-slate-100">
                            <td className="py-3 font-medium text-slate-900">#{order.id.slice(-8)}</td>
                            <td className="py-3 text-slate-700">Customer #{order.customerId.slice(-8)}</td>
                            <td className="py-3">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status === "picked_up" ? "In Transit" : 
                                 order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 font-medium text-slate-900">${Number(order.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Management & System Controls */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-plus mr-2"></i>Add New Vendor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-motorcycle mr-2"></i>Approve Driver
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-chart-bar mr-2"></i>Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-cog mr-2"></i>System Settings
                </Button>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Server Status</span>
                  <Badge className="bg-emerald-100 text-emerald-800">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avg Response Time</span>
                  <span className="font-semibold text-slate-900">145ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Active Users</span>
                  <span className="font-semibold text-slate-900">{users.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Error Rate</span>
                  <span className="font-semibold text-emerald-600">0.02%</span>
                </div>
              </CardContent>
            </Card>

            {/* User Summary */}
            <Card>
              <CardHeader>
                <CardTitle>User Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-slate-200 rounded h-8 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Customers</span>
                      <span className="font-semibold">
                        {users.filter(u => u.role === "customer").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Drivers</span>
                      <span className="font-semibold">
                        {users.filter(u => u.role === "driver").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Vendors</span>
                      <span className="font-semibold">
                        {users.filter(u => u.role === "vendor").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Admins</span>
                      <span className="font-semibold">
                        {users.filter(u => u.role === "admin").length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
