import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema.client";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery<Order[]>({
    queryKey: ["/api/available-orders"],
  });

  const { data: myOrders = [], isLoading: loadingMy } = useQuery<Order[]>({
    queryKey: ["/api/my-orders"],
  });

  const assignOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest("POST", `/api/orders/${orderId}/assign`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
      toast({
        title: "Order assigned",
        description: "You have successfully picked up this order.",
      });
    },
    onError: (error) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
      toast({
        title: "Order updated",
        description: "Order status has been updated.",
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

  const activeOrders = myOrders.filter(order => 
    ["picked_up"].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Driver Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-motorcycle text-emerald-600 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Good evening, {user?.firstName}!
                </h2>
                <p className="text-slate-600">You're online and ready to deliver</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {myOrders.filter(o => o.status === "delivered").length}
                </div>
                <div className="text-sm text-slate-600">Today's Deliveries</div>
              </div>
              <Button variant="destructive">
                <i className="fas fa-power-off mr-2"></i>Go Offline
              </Button>
            </div>
          </div>
        </div>

        {/* Available and Active Orders */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Orders */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Orders</h3>
            {loadingAvailable ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse"></div>
                ))}
              </div>
            ) : availableOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <i className="fas fa-clipboard text-4xl text-slate-400 mb-4"></i>
                  <h4 className="font-medium text-slate-900 mb-2">No available orders</h4>
                  <p className="text-sm text-slate-600">Check back later for new delivery opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">Order #{order.id.slice(-8)}</h4>
                          <p className="text-slate-600 text-sm">Pickup and delivery</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ${Number(order.total).toFixed(2)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                        <span><i className="fas fa-map-marker-alt mr-1"></i> {order.deliveryAddress}</span>
                      </div>
                      
                      <Button
                        onClick={() => assignOrderMutation.mutate(order.id)}
                        disabled={assignOrderMutation.isPending}
                        className="w-full"
                      >
                        {assignOrderMutation.isPending ? "Assigning..." : "Accept Order"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active Deliveries */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Deliveries</h3>
            {loadingMy ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-slate-200 rounded-xl h-40 animate-pulse"></div>
                ))}
              </div>
            ) : activeOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <i className="fas fa-truck text-4xl text-slate-400 mb-4"></i>
                  <h4 className="font-medium text-slate-900 mb-2">No active deliveries</h4>
                  <p className="text-sm text-slate-600">Accept an available order to start delivering.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-emerald-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">Order #{order.id.slice(-8)}</h4>
                          <p className="text-slate-600 text-sm">In Progress</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {order.status === "picked_up" ? "In Transit" : order.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Delivery Address:</span>
                          <span className="font-medium">{order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Total:</span>
                          <span className="font-medium">${Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => updateStatusMutation.mutate({ 
                          orderId: order.id, 
                          status: "delivered" 
                        })}
                        disabled={updateStatusMutation.isPending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <i className="fas fa-check mr-2"></i>
                        {updateStatusMutation.isPending ? "Updating..." : "Mark Delivered"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
