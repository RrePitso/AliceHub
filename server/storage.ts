import { 
  users, vendors, menuItems, orders, drivers,
  type User, type InsertUser, type Vendor, type InsertVendor,
  type MenuItem, type InsertMenuItem, type Order, type InsertOrder,
  type Driver, type InsertDriver
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPgSimple(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vendor operations
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendors(): Promise<Vendor[]>;
  updateVendorStatus(id: string, isOpen: boolean): Promise<void>;
  
  // Menu operations
  getMenuItems(vendorId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByVendor(vendorId: string): Promise<Order[]>;
  getOrdersByDriver(driverId: string): Promise<Order[]>;
  getAvailableOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: Order["status"]): Promise<void>;
  assignDriverToOrder(orderId: string, driverId: string): Promise<void>;
  
  // Driver operations
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByUserId(userId: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  getAvailableDrivers(): Promise<Driver[]>;
  updateDriverOnlineStatus(id: string, isOnline: boolean): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllOrders(): Promise<Order[]>;
  getPlatformStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeVendors: number;
    activeDrivers: number;
  }>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: insertUser.role as "customer" | "driver" | "vendor" | "admin"
    }).returning();
    return user;
  }

  // Vendor operations
  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.isOpen, true));
  }

  async updateVendorStatus(id: string, isOpen: boolean): Promise<void> {
    await db.update(vendors).set({ isOpen }).where(eq(vendors.id, id));
  }

  // Menu operations
  async getMenuItems(vendorId: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.vendorId, vendorId));
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db.insert(menuItems).values(item).returning();
    return menuItem;
  }

  async updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<void> {
    await db.update(menuItems).set({ isAvailable }).where(eq(menuItems.id, id));
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      status: insertOrder.status as "pending" | "accepted" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled",
      items: insertOrder.items as Array<{
        itemId: string;
        name: string;
        price: number;
        quantity: number;
      }>
    }).returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.vendorId, vendorId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByDriver(driverId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.driverId, driverId))
      .orderBy(desc(orders.createdAt));
  }

  async getAvailableOrders(): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.status, "ready"))
      .orderBy(orders.createdAt);
  }

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    await db.update(orders)
      .set({ status, updatedAt: sql`NOW()` })
      .where(eq(orders.id, id));
  }

  async assignDriverToOrder(orderId: string, driverId: string): Promise<void> {
    await db.update(orders)
      .set({ driverId, status: "picked_up", updatedAt: sql`NOW()` })
      .where(eq(orders.id, orderId));
  }

  // Driver operations
  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getDriverByUserId(userId: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver || undefined;
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isOnline, true));
  }

  async updateDriverOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await db.update(drivers).set({ isOnline }).where(eq(drivers.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getPlatformStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeVendors: number;
    activeDrivers: number;
  }> {
    const [totalOrdersResult] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [totalRevenueResult] = await db.select({ sum: sql<number>`sum(${orders.total})` }).from(orders);
    const [activeVendorsResult] = await db.select({ count: sql<number>`count(*)` }).from(vendors).where(eq(vendors.isOpen, true));
    const [activeDriversResult] = await db.select({ count: sql<number>`count(*)` }).from(drivers).where(eq(drivers.isOnline, true));

    return {
      totalOrders: totalOrdersResult?.count || 0,
      totalRevenue: Number(totalRevenueResult?.sum) || 0,
      activeVendors: activeVendorsResult?.count || 0,
      activeDrivers: activeDriversResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
