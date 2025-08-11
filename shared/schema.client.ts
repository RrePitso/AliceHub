// schema.client.ts
import { z } from "zod";
import {
  insertUserSchema as serverInsertUserSchema,
  insertVendorSchema as serverInsertVendorSchema,
  insertMenuItemSchema as serverInsertMenuItemSchema,
  insertOrderSchema as serverInsertOrderSchema,
  insertDriverSchema as serverInsertDriverSchema,
} from "./schema";

// Re-export Zod schemas (safe for client)
export const insertUserSchema = serverInsertUserSchema;
export const insertVendorSchema = serverInsertVendorSchema;
export const insertMenuItemSchema = serverInsertMenuItemSchema;
export const insertOrderSchema = serverInsertOrderSchema;
export const insertDriverSchema = serverInsertDriverSchema;

// Define client-safe types (matching your server types, but without Drizzle ORM)
export type User = z.infer<typeof insertUserSchema> & {
  id?: string;
  createdAt?: string;
};
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vendor = z.infer<typeof insertVendorSchema> & {
  id?: string;
  createdAt?: string;
  rating?: string;
};
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type MenuItem = z.infer<typeof insertMenuItemSchema> & {
  id?: string;
  createdAt?: string;
};
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = z.infer<typeof insertOrderSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Driver = z.infer<typeof insertDriverSchema> & {
  id?: string;
  createdAt?: string;
  rating?: string;
  totalDeliveries?: number;
};
export type InsertDriver = z.infer<typeof insertDriverSchema>;

