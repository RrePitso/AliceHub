import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, Vendor, MenuItem } from "@shared/schema.client";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: myOrders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/my-orders"],
  });

  const { data: vendor } = useQuery<Vendor>({
    queryKey: ["/api/vendors/me"],
    enabled: !!user,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingOrders = myOrders.filter(order => order.status === "pending");
  const preparingOrders = myOrders.filter(order => order.status === "preparing");
  const completedToday = myOrders.filter(order => 
    order.status === "delivered" && 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  );

  const todayRevenue = completedToday.reduce((sum, order) => sum + Number(order.total), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-store text-primary-600 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {user?.firstName}'s Restaurant
                </h2>
                <p className="text-slate-600">Open • Managing orders and menu</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  ${todayRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">Today's Revenue</div>
              </div>
              <Button variant="destructive">
                <i className="fas fa-pause mr-2"></i>Pause Orders
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Incoming Orders */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Incoming Orders</h3>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-200 rounded-xl h-48 animate-pulse"></div>
                ))}
              </div>
            ) : myOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-clipboard-list text-4xl text-slate-400 mb-4"></i>
                  <h4 className="font-medium text-slate-900 mb-2">No orders yet</h4>
                  <p className="text-slate-600">New orders will appear here when customers place them.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myOrders.slice(0, 10).map((order) => {
                  const borderColor = order.status === "pending" ? "border-yellow-500" :
                                    order.status === "preparing" ? "border-blue-500" :
                                    order.status === "ready" ? "border-green-500" : "border-slate-300";
                  
                  return (
                    <Card key={order.id} className={`border-l-4 ${borderColor}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-slate-900">Order #{order.id.slice(-8)}</h4>
                            <p className="text-slate-600 text-sm">Customer order</p>
                            <p className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === "pending" ? "New Order" :
                             order.status === "accepted" ? "Accepted" :
                             order.status === "preparing" ? "Preparing" :
                             order.status === "ready" ? "Ready" : order.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${Number(order.total).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          {order.status === "pending" && (
                            <>
                              <Button
                                onClick={() => updateOrderStatusMutation.mutate({
                                  orderId: order.id,
                                  status: "accepted"
                                })}
                                disabled={updateOrderStatusMutation.isPending}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                Accept Order
                              </Button>
                              <Select onValueChange={(value) => console.log("Prep time:", value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="15 min" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 min</SelectItem>
                                  <SelectItem value="20">20 min</SelectItem>
                                  <SelectItem value="25">25 min</SelectItem>
                                  <SelectItem value="30">30 min</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          )}
                          
                          {order.status === "accepted" && (
                            <Button
                              onClick={() => updateOrderStatusMutation.mutate({
                                orderId: order.id,
                                status: "preparing"
                              })}
                              disabled={updateOrderStatusMutation.isPending}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Start Preparing
                            </Button>
                          )}
                          
                          {order.status === "preparing" && (
                            <Button
                              onClick={() => updateOrderStatusMutation.mutate({
                                orderId: order.id,
                                status: "ready"
                              })}
                              disabled={updateOrderStatusMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              Mark Ready for Pickup
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats and Quick Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Orders Today</span>
                  <span className="font-semibold">{completedToday.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Pending Orders</span>
                  <span className="font-semibold">{pendingOrders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Preparing</span>
                  <span className="font-semibold">{preparingOrders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Revenue</span>
                  <span className="font-semibold text-emerald-600">${todayRevenue.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <i className="fas fa-plus mr-2"></i>Add Menu Item
                </Button>
                <Button className="w-full" variant="outline">
                  <i className="fas fa-edit mr-2"></i>Update Menu
                </Button>
                <Button className="w-full" variant="outline">
                  <i className="fas fa-chart-bar mr-2"></i>View Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  <i className="fas fa-cog mr-2"></i>Restaurant Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
