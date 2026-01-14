"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2 } from "lucide-react"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { apiClient } from "@/lib/apiClient"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type FormData = {
  email: string
  otp: string
  password: string
  confirmPassword: string
}

export default function ResetPasswordForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const router = useRouter();

  // 1. Setup React Hook Form without Zod resolver
  const {
    register,
    control,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Real-time validation
  })

  // Watch password for confirm validation
  const password = watch("password")

  // --- Navigation Handlers ---

  const handleNextStep = async (fieldsToValidate: (keyof FormData)[]) => {
    // Validate only the fields for the current step
    const isValid = await trigger(fieldsToValidate)
    if (!isValid) return

    // step - 1: send password reset verification code to email
    if (step === 1) {
      setLoading(true);
      try {
        const response = await apiClient.post("/api/auth/password/send", { email: getValues("email") });

        toast.success(response.data.message || "Password reset email sent successfully");
        setStep(2);
      } catch (error: any) {
        toast(
          error?.response?.data?.message || "Failed to send password reset email"
        )
      } finally {
        setLoading(false);
      }
    }

    // step - 2: verify password verification code
    if (step === 2) {
      setLoading(true);

      try {
        const response = await apiClient.post("/api/auth/password/verify", {
          email: getValues("email"),
          otp: getValues("otp")
        })
        setResetToken(response.data?.data?.resetToken); // set reset token to use in the next step
        toast.success(response.data.message || "OTP verified successfully");
        setStep(3);
      } catch (error: any) {
        toast(
          error?.response?.data?.message || "Failed to send password reset email"
        )
      } finally {
        setLoading(false);
      }
    }
  }

  // Final Submit Handler
  const handleFinalSubmit = async () => {
    const isValid = await trigger(["password", "confirmPassword"])
    if (!isValid) return

    setLoading(true);
    try {
      console.log(getValues("password"))
      const response = await apiClient.post(
        "/api/auth/password/reset",
        { newPassword: getValues("password") },
        { headers: { Authorization: `Bearer ${resetToken}` } }
      )
      toast.success(response.data.message || "Password reset successfully");
      router.push("/login");
    } catch (error: any) {
      toast(
        error?.response?.data?.message || "Failed to reset password"
      )
    } finally {
      setLoading(false);
    }
  }

  return (
      <Card className="w-100">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Reset Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "New Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to receive a code."}
            {step === 2 && "Enter the 6-digit code sent to your email."}
            {step === 3 && "Secure your account with a new password."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          
          {/* STEP 1: Email */}
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Please enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          )}

          {/* STEP 2: Input OTP (Controlled Component) */}
          {step === 2 && (
            <div className="space-y-2 flex flex-col items-center">
              <Label htmlFor="otp" className="self-center">One-Time Password</Label>
              {/* Using Controller for complex inputs like OTP */}
              <Controller
                control={control}
                name="otp"
                rules={{
                  required: "OTP is required",
                  minLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                }}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {errors.otp && (
                <p className="text-sm text-red-500">{errors.otp.message}</p>
              )}
            </div>
          )}

          {/* STEP 3: Passwords */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep((p) => p - 1)}
              disabled={loading}
            >
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              className="w-full"
              onClick={() => handleNextStep(["email"])}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          )}

          {step === 2 && (
            <Button
              className="ml-auto"
              onClick={() => handleNextStep(["otp"])}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          )}

          {step === 3 && (
            <Button
              className="ml-auto"
              onClick={handleFinalSubmit}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          )}
        </CardFooter>
      </Card>
  )
}