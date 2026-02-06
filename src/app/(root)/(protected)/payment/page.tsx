"use client";

import { apiClient } from "@/lib/apiClient";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { CheckCircle2, XCircle, Clock, RotateCcw, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming shadcn path
import { Button } from "@/components/ui/button";

type Booking = {
  status: "expired" | "pending" | "success" | "refunded" | "failed";
  amount?: number; // Optional: display amount if available
};

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const { data: booking, isLoading, error } = useSWR<Booking>(
    orderId ? `/api/bookings/${orderId}` : null,
    async (url: string) => {
      const { data: { data } } = await apiClient.get(url);
      return data;
    },
    {
      refreshInterval: 3000
    }
  );

  // Helper to determine UI content based on status
  const getStatusConfig = (status: Booking["status"]) => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-green-600" />,
          title: "Payment Successful",
          message: "Your booking has been confirmed.",
          color: "bg-green-50 border-green-200",
          textColor: "text-green-600",
        };
      case "pending":
        return {
          icon: <Loader2 className="h-16 w-16 text-yellow-600 animate-spin" />,
          title: "Payment Processing",
          message: "Please wait for a while, we are verifying your payment.",
          color: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-600",
        };
      case "failed":
        return {
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          title: "Payment Failed",
          message: "If money was debited from your account, it will be refunded automatically in 2-3 working days.",
          color: "bg-red-50 border-red-200",
          textColor: "text-red-600",
        };
      case "expired":
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-600" />,
          title: "Session Expired",
          message: "If money was debited from your account, it will be refunded automatically in 2-3 working days.",
          color: "bg-red-50 border-red-200",
          textColor: "text-red-600",
        };
      case "refunded":
        return {
          icon: <RotateCcw className="h-16 w-16 text-blue-600" />,
          title: "Payment Refunded",
          message: "The money has been refunded to your source account.",
          color: "bg-blue-50 border-blue-200",
          textColor: "text-blue-600",
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-gray-400" />,
          title: "Unknown Status",
          message: "We could not determine the status of your payment.",
          color: "bg-gray-50 border-gray-200",
          textColor: "text-gray-600",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="mt-2 text-gray-500">We couldn't fetch the payment details.</p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button onClick={() => router.push("/")} variant="outline">Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const config = getStatusConfig(booking.status);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className={`w-full max-w-md overflow-hidden border-t-4 shadow-lg ${config.color.split(' ')[1].replace('border', 'border-t')}`}>
        <CardHeader className={`flex flex-col items-center pb-2 pt-10 text-center ${config.color} bg-opacity-30`}>
          <div className="mb-4 rounded-full bg-white p-3 shadow-sm">
            {config.icon}
          </div>
          <CardTitle className={`text-2xl font-bold ${config.textColor}`}>
            {config.title}
          </CardTitle>
          {orderId && (
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Order ID: {orderId}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4 px-6 py-8 text-center">
          <p className="text-lg font-medium text-gray-700">
            {config.message}
          </p>
          
          {/* Optional: Add timestamp or amount here if available in data */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleString()}</span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t bg-gray-50/50 p-6">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => router.push("/dashboard")}
          >
            Done
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}