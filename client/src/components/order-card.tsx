import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Order } from "@shared/schema.client";

interface OrderCardProps {
  order: Order;
  showActions?: boolean;
  onUpdateStatus?: (orderId: string, status: string) => void;
}

export default function OrderCard({ order, showActions = false, onUpdateStatus }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-100 text-emerald-800";
      case "picked_up": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "picked_up": return "Out for Delivery";
      case "pending": return "New Order";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-slate-900">Order #{order.id.slice(-8)}</h4>
            <p className="text-slate-600 text-sm">{order.items.length} items</p>
            <p className="text-xs text-slate-500">
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </div>

        {/* Order Items Summary */}
        <div className="mb-4">
          <div className="text-sm text-slate-600 mb-2">Items:</div>
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="text-sm text-slate-700">
              {item.quantity}x {item.name}
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-xs text-slate-500">
              +{order.items.length - 2} more items
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-slate-900">
            Total: ${Number(order.total).toFixed(2)}
          </span>
          {order.deliveryAddress && (
            <span className="text-xs text-slate-600">
              <i className="fas fa-map-marker-alt mr-1"></i>
              {order.deliveryAddress.length > 30 
                ? `${order.deliveryAddress.substring(0, 30)}...` 
                : order.deliveryAddress
              }
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <Link href={`/order/${order.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <i className="fas fa-eye mr-2"></i>View Details
            </Button>
          </Link>
          
          {showActions && onUpdateStatus && (
            <>
              {order.status === "pending" && (
                <Button
                  onClick={() => onUpdateStatus(order.id, "accepted")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  Accept
                </Button>
              )}
              
              {order.status === "accepted" && (
                <Button
                  onClick={() => onUpdateStatus(order.id, "preparing")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Start Preparing
                </Button>
              )}
              
              {order.status === "preparing" && (
                <Button
                  onClick={() => onUpdateStatus(order.id, "ready")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Ready
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
