// client/src/shared/schema.client.ts
import { z } from "zod";

// --------------------
// Users
// --------------------
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["customer", "driver", "vendor", "admin"]),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type User = z.infer<typeof insertUserSchema> & {
  id?: string;
  createdAt?: string;
};
export type InsertUser = z.infer<typeof insertUserSchema>;

// --------------------
// Vendors
// --------------------
export const insertVendorSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  cuisine: z.string(),
  address: z.string(),
  phone: z.string(),
  imageUrl: z.string().optional(),
  deliveryFee: z.number(),
  minimumOrder: z.number().optional(),
  deliveryTime: z.number(),
  isOpen: z.boolean().optional(),
  rating: z.number().optional(),
});

export type Vendor = z.infer<typeof insertVendorSchema> & {
  id?: string;
  createdAt?: string;
  rating?: number;
};
export type InsertVendor = z.infer<typeof insertVendorSchema>;

// --------------------
// Menu Items
// --------------------
export const insertMenuItemSchema = z.object({
  vendorId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  category: z.string(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export type MenuItem = z.infer<typeof insertMenuItemSchema> & {
  id?: string;
  createdAt?: string;
};
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// --------------------
// Orders
// --------------------
export const insertOrderSchema = z.object({
  customerId: z.string(),
  vendorId: z.string(),
  driverId: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  subtotal: z.number(),
  deliveryFee: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum([
    "pending",
    "accepted",
    "preparing",
    "ready",
    "picked_up",
    "delivered",
    "cancelled",
  ]),
  deliveryAddress: z.string(),
  customerNotes: z.string().optional(),
  estimatedDeliveryTime: z.number().optional(),
});

export type Order = z.infer<typeof insertOrderSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// --------------------
// Drivers
// --------------------
export const insertDriverSchema = z.object({
  userId: z.string(),
  vehicleType: z.string(),
  licenseNumber: z.string(),
  isOnline: z.boolean().optional(),
  currentLocationLat: z.number().optional(),
  currentLocationLng: z.number().optional(),
  totalDeliveries: z.number().optional(),
  rating: z.number().optional(),
});

export type Driver = z.infer<typeof insertDriverSchema> & {
  id?: string;
  createdAt?: string;
  rating?: number;
  totalDeliveries?: number;
};
export type InsertDriver = z.infer<typeof insertDriverSchema>;
