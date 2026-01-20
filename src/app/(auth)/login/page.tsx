"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useForm, SubmitHandler } from "react-hook-form";
import { ENV } from "@/app/env";
import React from "react";
import { EyeClosed, EyeIcon, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { apiClient } from "@/lib/apiClient";

interface IFormInputs {
  email: string,
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const { handleSubmit, formState: { errors, isSubmitting }, register, reset,  } = useForm<IFormInputs>({
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const handleLogin: SubmitHandler<IFormInputs> = async (data) => {
    try {
      const response = await apiClient.post("/api/users/login", data);

      // extract user info from the response body
      const { data: { user } } = response.data;
      
      // store user information
      setUser({
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      })

      // check if email is verified
      if (user.isEmailVerified === false) {
        // send email otp
        try {
          const response = await apiClient.post("/api/auth/email/send");
          toast.success(
            response.data.message ||
            "Verification email sent successfully"
          )
          router.push("/verify-email");
          return;
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
            "Failed to send verification, redirecting..."
          )
        }
      }
      
      router.push(`/dashboard`);
      toast.success("User logged in successfully")
      reset();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to login, something is broke internally"
      )
    }
  }

  return (
    <Card className={cn(
      "w-full max-w-md",
      "border border-black dark:border-input"
    )}>

      {/* Header Section */}
      <CardHeader className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
      </CardHeader>

      {/* Form Section */}
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(handleLogin)}
        >
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="border border-black/20 dark:border-input"
              placeholder="you@example.com"
              {...register("email", {
                required: { value: true, message: "Email is required" },
                pattern: {
                  // email validation regex
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                },
                minLength: {
                  value: 3,
                  message: "Email must be at least 3 characters long"
                },
                maxLength: {
                  value: 100,
                  message: "Email must be at most 100 characters long"
                }
              })}
            />
            <React.Activity mode={errors.email ? "visible" : "hidden"}>
              <p className="dark:text-red-300 text-red-500 text-sm">{ errors.email?.message }</p>
            </React.Activity>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                className="border dark:border-input border-black/20"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password", {
                  required: { value: true, message: "Password is required" },
                  minLength: {
                    value: 6,
                    message: "Password is two short it must be 6 characters"
                  }
                })}
              />
              <button
                type="button"
                className="cursor-pointer absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeClosed className="size-5"/> : <EyeIcon className="size-5"/>}
              </button>
            </div>
            
            <React.Activity
              mode={errors.password ? "visible" : "hidden"}
            >
              <p className="dark:text-red-300 text-red-400 text-sm">{ errors.password?.message }</p>
            </React.Activity>
          </div>
          
          <div className="text-right">
            <Link href="/reset-password" className="text-sm underline cursor-pointer">Forgot Password</Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full mt-0.5 cursor-pointer",
              "dark:bg-gray-200 dark:hover:bg-gray-300 ",
              "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isSubmitting ? <LoaderIcon className="animate-spin size-5"/>: "Login into account"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Don't have an account?{" "}
          <Link href="/register" className={cn(
            "font-semibold dark:text-blue-400 hover:underline",
            "text-blue-500"
          )}>
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}