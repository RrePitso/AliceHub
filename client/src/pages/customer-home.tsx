import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import RestaurantCard from "@/components/restaurant-card";
import { Link } from "wouter";
import type { Vendor } from "@shared/schema";

const categories = [
  { name: "Pizza", icon: "fa-pizza-slice", color: "orange" },
  { name: "Healthy", icon: "fa-leaf", color: "green" },
  { name: "Burgers", icon: "fa-hamburger", color: "red" },
  { name: "Desserts", icon: "fa-ice-cream", color: "yellow" },
  { name: "Seafood", icon: "fa-fish", color: "blue" },
  { name: "Coffee", icon: "fa-coffee", color: "purple" },
];

export default function CustomerHome() {
  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Order Food from Your Favorite Restaurants</h1>
            <p className="text-xl mb-8 text-primary-100">Fast delivery • Wide selection • Track in real-time</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search restaurants, cuisines, or dishes..." 
                  className="w-full px-6 py-4 pl-12 rounded-xl text-slate-900 text-lg"
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center cursor-pointer">
                <div className={`w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <i className={`fas ${category.icon} text-${category.color}-600 text-2xl`}></i>
                </div>
                <h3 className="font-medium text-slate-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Popular Near You</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : vendors?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <RestaurantCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-store text-4xl text-slate-400 mb-4"></i>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No restaurants available</h3>
                <p className="text-slate-600">Check back later for new restaurants in your area.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
