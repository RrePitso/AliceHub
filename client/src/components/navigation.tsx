import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "customer":
        return [
          { href: "/", label: "Home", icon: "fa-home" },
          { href: "/my-orders", label: "My Orders", icon: "fa-receipt" },
        ];
      case "driver":
        return [
          { href: "/driver", label: "Dashboard", icon: "fa-tachometer-alt" },
          { href: "/my-orders", label: "My Deliveries", icon: "fa-truck" },
        ];
      case "vendor":
        return [
          { href: "/vendor", label: "Dashboard", icon: "fa-store" },
          { href: "/menu", label: "Menu", icon: "fa-utensils" },
        ];
      case "admin":
        return [
          { href: "/admin", label: "Dashboard", icon: "fa-chart-bar" },
          { href: "/admin/users", label: "Users", icon: "fa-users" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                <i className="fas fa-truck mr-2"></i>QuickDeliver
              </h1>
            </Link>
            
            {navItems.length > 0 && (
              <nav className="hidden md:flex ml-8 space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? "bg-primary-100 text-primary-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <i className={`fas ${item.icon} mr-2`}></i>
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-sm font-medium text-slate-700">
                      {user.firstName} {user.lastName}
                    </span>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "..." : "Sign Out"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
