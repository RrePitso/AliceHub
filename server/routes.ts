import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertVendorSchema, insertMenuItemSchema, insertOrderSchema, insertDriverSchema,
  type User, type Order
} from "./shared/schema";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check specific role
  const requireRole = (role: string) => (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `${role} role required` });
    }
    next();
  };

  // --- Vendor routes ---
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
      res.json(vendor);
    } catch {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", requireAuth, requireRole("vendor"), async (req, res) => {
    try {
      const user = req.user as User;
      const validated = insertVendorSchema.parse({ ...req.body, userId: user.id });
      const vendor = await storage.createVendor(validated);
      res.status(201).json(vendor);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Invalid vendor data", errors: err.errors });
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.put("/api/vendors/:id/status", requireAuth, requireRole("vendor"), async (req, res) => {
    try {
      await storage.updateVendorStatus(req.params.id, req.body.isOpen);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to update vendor status" });
    }
  });

  // --- Menu routes ---
  app.get("/api/vendors/:vendorId/menu", async (req, res) => {
    try {
      const menu = await storage.getMenuItems(req.params.vendorId);
      res.json(menu);
    } catch {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", requireAuth, requireRole("vendor"), async (req, res) => {
    try {
      const user = req.user as User;
      const vendor = await storage.getVendorByUserId(user.id);
      if (!vendor) return res.status(403).json({ message: "Vendor account required" });

      const validated = insertMenuItemSchema.parse({ ...req.body, vendorId: vendor.id });
      const menuItem = await storage.createMenuItem(validated);
      res.status(201).json(menuItem);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Invalid menu item data", errors: err.errors });
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/menu-items/:id/availability", requireAuth, requireRole("vendor"), async (req, res) => {
    try {
      await storage.updateMenuItemAvailability(req.params.id, req.body.isAvailable);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to update menu item availability" });
    }
  });

  // --- Order routes ---
  app.post("/api/orders", requireAuth, requireRole("customer"), async (req, res) => {
    try {
      const user = req.user as User;
      const validated = insertOrderSchema.parse({ ...req.body, customerId: user.id, status: "pending" });
      const order = await storage.createOrder(validated);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Invalid order data", errors: err.errors });
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const user = req.user as User;
      const canView = order.customerId === user.id || order.driverId === user.id || user.role === "admin" || (user.role === "vendor" && order.vendorId);
      if (!canView) return res.status(403).json({ message: "Access denied" });

      res.json(order);
    } catch {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/my-orders", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      let orders: Order[] = [];
      if (user.role === "customer") orders = await storage.getOrdersByCustomer(user.id);
      else if (user.role === "driver") orders = await storage.getOrdersByDriver(user.id);
      else if (user.role === "vendor") {
        const vendor = await storage.getVendorByUserId(user.id);
        if (vendor) orders = await storage.getOrdersByVendor(vendor.id);
      }
      res.json(orders);
    } catch {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put("/api/orders/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const user = req.user as User;
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const canUpdate = (user.role === "vendor" && ["accepted", "preparing", "ready"].includes(status)) ||
                        (user.role === "driver" && ["picked_up", "delivered"].includes(status)) ||
                        user.role === "admin";
      if (!canUpdate) return res.status(403).json({ message: "Cannot update order status" });

      await storage.updateOrderStatus(req.params.id, status);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // --- Driver routes ---
  app.get("/api/available-orders", requireAuth, requireRole("driver"), async (req, res) => {
    try {
      const orders = await storage.getAvailableOrders();
      res.json(orders);
    } catch {
      res.status(500).json({ message: "Failed to fetch available orders" });
    }
  });

  app.post("/api/orders/:id/assign", requireAuth, requireRole("driver"), async (req, res) => {
    try {
      const user = req.user as User;
      await storage.assignDriverToOrder(req.params.id, user.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to assign order" });
    }
  });

  app.post("/api/drivers", requireAuth, requireRole("driver"), async (req, res) => {
    try {
      const user = req.user as User;
      const validated = insertDriverSchema.parse({ ...req.body, userId: user.id });
      const driver = await storage.createDriver(validated);
      res.status(201).json(driver);
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ message: "Invalid driver data", errors: err.errors });
      res.status(500).json({ message: "Failed to create driver profile" });
    }
  });

  app.put("/api/drivers/:id/status", requireAuth, requireRole("driver"), async (req, res) => {
    try {
      await storage.updateDriverOnlineStatus(req.params.id, req.body.isOnline);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  // --- Admin routes ---
  app.get("/api/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/orders", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch {
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  return createServer(app);
}
