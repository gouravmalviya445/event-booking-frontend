"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { EyeClosed, EyeIcon, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { apiClient } from "@/lib/apiClient";

type Role = "attendee" | "organizer";

interface IFormInputs {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser)

  const { handleSubmit, formState: { errors, isSubmitting }, register, reset  } = useForm<IFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "attendee"
    }
  })
  const handleRegister: SubmitHandler<IFormInputs> = async (data) => {
    try {
      const response = await apiClient.post("/api/users/register", data);

      if (response.data.success === false) {
        toast.error(response.data.message || "Error user login")
        return;
      }

      const { data: { user } } = response.data;
      // store user information
      setUser({
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      })

      // send email otp
      try {
        const response = await apiClient.post("/api/auth/email/send");
        toast.success(
          response.data.message ||
          "Verification email sent successfully"
        )
        router.push("/verify-email");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
          "Failed to send verification"
        )
      }
      reset();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to register User, something is broke internally"
      )
    }
  }

  return (
    <Card className={cn(
      "w-full max-w-125",
      "shadow-[0_20px_50px] dark:shadow-black/40 shadow-blue-300"
    )}>

      {/* Header Section */}
      <CardHeader className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Get started with Getherly today
          </p>
        </div>
      </CardHeader>

      {/* Form Section */}
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(handleRegister)}
        >
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              className="border dark:border-input border-black/20"
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name", {
                required: { value: true, message: "Full Name is required" },
                minLength: {
                  value: 3,
                  message: "Full Name at least 3 characters long"
                },
                maxLength: {
                  value: 100,
                  message: "Full Name at most 100 characters long"
                }
              })}
            />
            <React.Activity mode={errors.name ? "visible" : "hidden"}>
              <p className="dark:text-red-300 text-red-500 text-sm">{ errors.name?.message }</p>
            </React.Activity>
          </div>
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              className="border dark:border-input border-black/20"
              type="email"
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
                    message: "Password is too short it must be 6 characters"
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                    message: `password is too weak it must be combination of letter and digits with no spaces`
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
              <p className="dark:text-red-300 text-red-400 text-sm">{ errors.password?.message}</p>
            </React.Activity>
          </div>

          {/* Account type */}
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <select
              className={cn(
                "border w-full py-1.5 px-2 border-black/20 rounded-md text-sm",
                "dark:border-input focus:outline-none"
              )}
              {...register("role")}
            >
              <option className="border-black/20 dark:border-input dark:bg-black/80" value="attendee">Attendee - Browse and book events</option>
              <option className="border-black/20 dark:border-input dark:bg-black/80" value="organizer">Organizer - Create and manage events</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full mt-0.5 cursor-pointer",
              "dark:bg-gray-200 dark:hover:bg-gray-300",
              "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isSubmitting ? <LoaderIcon className="animate-spin size-5"/>: "Register your account"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold dark:text-blue-400 hover:underline text-blue-500">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}