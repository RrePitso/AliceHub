import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "customer",
      phone: "",
      address: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    const redirectPath = user.role === "driver" ? "/driver" :
                        user.role === "vendor" ? "/vendor" :
                        user.role === "admin" ? "/admin" : "/";
    return <Redirect to={redirectPath} />;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-truck text-3xl text-primary mr-3"></i>
              <h1 className="text-2xl font-bold text-slate-900">QuickDeliver</h1>
            </div>
            <CardTitle>{isLogin ? "Welcome back" : "Create your account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to your account" : "Join our delivery platform"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...loginForm.register("username")}
                    className="mt-1"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="mt-1"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...registerForm.register("firstName")}
                      className="mt-1"
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...registerForm.register("lastName")}
                      className="mt-1"
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...registerForm.register("username")}
                    className="mt-1"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerForm.register("email")}
                    className="mt-1"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(value) => registerForm.setValue("role", value as any)} defaultValue="customer">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...registerForm.register("password")}
                    className="mt-1"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                    className="mt-1"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero */}
      <div className="flex-1 bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <i className="fas fa-truck text-6xl mb-8 opacity-90"></i>
          <h2 className="text-4xl font-bold mb-4">Fast Food Delivery</h2>
          <p className="text-xl text-primary-100 mb-8">
            Connect customers, restaurants, and drivers in one seamless platform
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-4">
              <i className="fas fa-users text-2xl mb-2"></i>
              <div>Multi-role Platform</div>
            </div>
            <div className="bg-primary-500 bg-opacity-50 rounded-lg p-4">
              <i className="fas fa-clock text-2xl mb-2"></i>
              <div>Real-time Tracking</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
