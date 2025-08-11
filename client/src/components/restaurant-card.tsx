import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Vendor } from "@shared/schema.client";

interface RestaurantCardProps {
  vendor: Vendor;
}

export default function RestaurantCard({ vendor }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${vendor.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
          <i className="fas fa-store text-4xl text-slate-400"></i>
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{vendor.name}</h3>
            <div className="flex items-center text-sm text-slate-600">
              <i className="fas fa-star text-yellow-400 mr-1"></i>
              <span>{Number(vendor.rating).toFixed(1)}</span>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-3">{vendor.cuisine}</p>
          {vendor.description && (
            <p className="text-slate-500 text-xs mb-3 line-clamp-2">{vendor.description}</p>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">
              <i className="fas fa-clock mr-1"></i>
              {vendor.deliveryTime} min
            </span>
            <span className="text-slate-600">
              <i className="fas fa-truck mr-1"></i>
              {Number(vendor.deliveryFee) > 0 
                ? `$${Number(vendor.deliveryFee).toFixed(2)} delivery`
                : "Free delivery"
              }
            </span>
          </div>
          {vendor.isOpen ? (
            <Badge variant="secondary" className="mt-3 bg-emerald-100 text-emerald-800">
              Open
            </Badge>
          ) : (
            <Badge variant="secondary" className="mt-3 bg-red-100 text-red-800">
              Closed
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
