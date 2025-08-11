import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vendor, MenuItem } from "@shared/schema.client";

export default function RestaurantMenu() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([]);
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const { data: vendor, isLoading: loadingVendor } = useQuery<Vendor>({
    queryKey: ["/api/vendors", id],
    enabled: !!id,
  });

  const { data: menuItems = [], isLoading: loadingMenu } = useQuery<MenuItem[]>({
    queryKey: ["/api/vendors", id, "menu"],
    enabled: !!id,
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the restaurant.",
      });
      setCart([]);
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.item.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    );
  };

  const subtotal = cart.reduce((sum, { item, quantity }) => sum + (Number(item.price) * quantity), 0);
  const deliveryFee = vendor ? Number(vendor.deliveryFee) : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart first.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      vendorId: id,
      items: cart.map(({ item, quantity }) => ({
        itemId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity,
      })),
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      tax: tax.toString(),
      total: total.toString(),
      deliveryAddress: deliveryAddress.trim(),
      customerNotes: notes.trim(),
    };

    placeOrderMutation.mutate(orderData);
  };

  if (loadingVendor || loadingMenu) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-slate-200 rounded-xl h-48"></div>
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-xl h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <i className="fas fa-store text-4xl text-slate-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Restaurant not found</h2>
          <p className="text-slate-600">This restaurant may no longer be available.</p>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center mr-6">
                <i className="fas fa-store text-primary-600 text-3xl"></i>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{vendor.name}</h1>
                <p className="text-slate-600 mb-2">{vendor.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span><i className="fas fa-utensils mr-1"></i>{vendor.cuisine}</span>
                  <span><i className="fas fa-clock mr-1"></i>{vendor.deliveryTime} min</span>
                  <span><i className="fas fa-truck mr-1"></i>${Number(vendor.deliveryFee).toFixed(2)} delivery</span>
                  <Badge variant="secondary">
                    <i className="fas fa-star mr-1"></i>{Number(vendor.rating).toFixed(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-utensils text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No menu available</h3>
                  <p className="text-slate-600">This restaurant hasn't added their menu yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {categories.map(category => (
                  <div key={category}>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4 capitalize">{category}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {menuItems
                        .filter(item => item.category === category && item.isAvailable)
                        .map(item => (
                          <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                  {item.description && (
                                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                  )}
                                </div>
                                <div className="ml-4 text-right">
                                  <div className="font-bold text-slate-900">${Number(item.price).toFixed(2)}</div>
                                </div>
                              </div>
                              <Button
                                onClick={() => addToCart(item)}
                                className="w-full"
                                size="sm"
                              >
                                <i className="fas fa-plus mr-2"></i>Add to Cart
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart and Checkout */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Order</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-shopping-cart text-4xl text-slate-400 mb-4"></i>
                    <p className="text-slate-600">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cart.map(({ item, quantity }) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{item.name}</h4>
                            <p className="text-sm text-slate-600">${Number(item.price).toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">
                        Delivery Address *
                      </label>
                      <Input
                        placeholder="Enter your full address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>

                    {/* Order Notes */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">
                        Order Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="Any special instructions for your order"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Place Order Button */}
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={placeOrderMutation.isPending || cart.length === 0}
                      className="w-full"
                    >
                      {placeOrderMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card mr-2"></i>
                          Place Order - ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
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
