import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import type { Order } from "@shared/schema.client";

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["/api/orders", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-slate-200 rounded-xl h-32"></div>
            <div className="bg-slate-200 rounded-xl h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <i className="fas fa-receipt text-4xl text-slate-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h2>
          <p className="text-slate-600">This order may not exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  const getStepStatus = (currentStatus: string, stepStatus: string) => {
    const statusOrder = ["pending", "accepted", "preparing", "ready", "picked_up", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (stepIndex <= currentIndex) return "completed";
    if (stepIndex === currentIndex + 1) return "current";
    return "upcoming";
  };

  const steps = [
    { status: "pending", label: "Order Placed", icon: "fa-check" },
    { status: "accepted", label: "Accepted", icon: "fa-check" },
    { status: "preparing", label: "Preparing", icon: "fa-utensils" },
    { status: "ready", label: "Ready", icon: "fa-check" },
    { status: "picked_up", label: "Out for Delivery", icon: "fa-truck" },
    { status: "delivered", label: "Delivered", icon: "fa-home" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Track Your Order</h1>
        
        {/* Order Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Order #{order.id.slice(-8)}</h3>
                <p className="text-slate-600">{order.items.length} items • ${Number(order.total).toFixed(2)}</p>
                <p className="text-sm text-slate-500">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <Badge className={
                order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                order.status === "picked_up" ? "bg-blue-100 text-blue-800" :
                order.status === "preparing" ? "bg-orange-100 text-orange-800" :
                "bg-slate-100 text-slate-800"
              }>
                {order.status === "picked_up" ? "Out for Delivery" :
                 order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-slate-900">Order Items</h4>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                  <div>
                    <span className="font-medium text-slate-900">{item.quantity}x {item.name}</span>
                  </div>
                  <span className="text-slate-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>${Number(order.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Order Progress</h3>
            
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => {
                const stepStatus = getStepStatus(order.status, step.status);
                const isCompleted = stepStatus === "completed";
                const isCurrent = stepStatus === "current";
                
                return (
                  <div key={step.status} className="flex flex-col items-center relative">
                    {index < steps.length - 1 && (
                      <div className={`absolute left-1/2 top-5 w-full h-1 ${
                        isCompleted ? "bg-emerald-600" : "bg-slate-300"
                      } transform -translate-x-1/2 z-0`} style={{ width: "calc(100% + 2rem)" }} />
                    )}
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 relative z-10 ${
                      isCompleted ? "bg-emerald-600 text-white" :
                      isCurrent ? "bg-emerald-600 text-white animate-pulse" :
                      "bg-slate-300 text-slate-500"
                    }`}>
                      <i className={`fas ${step.icon}`}></i>
                    </div>
                    <span className={`text-xs text-center font-medium ${
                      isCompleted || isCurrent ? "text-emerald-600" : "text-slate-500"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Delivery Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Delivery Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Delivery Address:</span>
                  <div className="font-medium">{order.deliveryAddress}</div>
                </div>
                {order.customerNotes && (
                  <div>
                    <span className="text-slate-600">Special Instructions:</span>
                    <div className="font-medium">{order.customerNotes}</div>
                  </div>
                )}
                {order.estimatedDeliveryTime && (
                  <div>
                    <span className="text-slate-600">Estimated Delivery:</span>
                    <div className="font-medium">{order.estimatedDeliveryTime} minutes</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Information (if assigned) */}
        {order.driverId && order.status === "picked_up" && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Driver</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-user text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Your Driver</h4>
                    <p className="text-sm text-slate-600">On the way to you</p>
                  </div>
                </div>
                <Button variant="outline">
                  <i className="fas fa-phone mr-2"></i>Contact Driver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
