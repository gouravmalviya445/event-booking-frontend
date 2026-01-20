"use client"

import { OtpResendTimer } from "@/components/OtpResendTimer";
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/input-otp";
import { apiClient } from "@/lib/apiClient";
import { useUserStore } from "@/store/userStore";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type OTP = {
  otp: string
}

export default function OTPVerificationPage() {
  const { user, updateIsEmailVerified } = useUserStore();
  const router = useRouter();
  
  const [isResending, setIsResending] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  const { handleSubmit, formState: { isSubmitting }, setValue } = useForm<OTP>({
    defaultValues: {
      otp: "",
    }
  });

  // verify otp
  const onSubmit: SubmitHandler<OTP> = async (data) => {
    try {
      const response = await apiClient.post("/api/auth/email/verify", { otp: data.otp });
      
      toast.success(response.data.message || "Email verified successfully");

      updateIsEmailVerified();

      router.push(`/dashboard`)
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to verify OTP"
      )
    }
  }
  
  // resend otp
  const handleResend = async function () {
    try {
      setIsResending(true);

      const response = await apiClient.post("/api/auth/email/send");
      toast.success(
        response.data.message ||
        "Verification email sent successfully"
      );
      setIsOtpSent(true);
    } catch (error: any) {
      toast(
        error?.response?.data?.message ||
        "Failed to send verification"
      )
    } finally {
      setIsResending(false);
    }

  }

  useEffect(() => {
    console.log(user)
    if (user?.isEmailVerified) {
      router.push(`/dashboard`)
    }
  }, [user, router])
  
  return (
    <Card className="w-full max-w-90 border border-black">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Verification Required
        </CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to your email.
          <br />
          <span className="font-semibold">
            {user?.email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <InputOTP 
              maxLength={6} 
              minLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              onChange={(e) => setValue("otp", e)}
            >
              <InputOTPGroup >
                <InputOTPSlot className="dark:border-input border-black/30 sm:size-12" index={0} />
                <InputOTPSlot className="dark:border-input border-black/30 sm:size-12" index={1} />
                <InputOTPSlot className="dark:border-input border-black/30 sm:size-12" index={2} />
                <InputOTPSlot className="dark:border-input border-black/30 sm:size-12" index={3} />
                <InputOTPSlot className="dark:border-input border-black/30 sm:size-12" index={4} />
                <InputOTPSlot className="dark:border-input border-black/30 sm:size-12" index={5} />
              </InputOTPGroup>

            </InputOTP>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="sm:w-full cursor-pointer"
          >
            { isSubmitting ? <Loader className="size-5 animate-spin"/> : "Verify" }
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Didn't receive code?{" "}
          {
            isOtpSent ? <OtpResendTimer isOtpSent={isOtpSent} setIsOtpSent={setIsOtpSent}/> :
            <button
              disabled={isResending}
              type="button"
              className="text-primary cursor-pointer underline-offset-4 hover:underline"
              onClick={handleResend}
            >
              {
                isResending
                  ? <Loader className="size-5 animate-spin" />
                  : "Resend"
              }
            </button>
          }
        </p>
      </CardFooter>
    </Card>
  )
}