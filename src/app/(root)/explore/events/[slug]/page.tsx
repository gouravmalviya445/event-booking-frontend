"use client";

import { apiClient } from "@/lib/apiClient";
import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { 
  CalendarDays, 
  MapPin, 
  User, 
  Share2, 
  Ticket, 
  AlertCircle, 
  Minus, 
  Plus,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { toast } from "sonner";
import { getOptions, loadScript } from "@/service/razorpay";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface EventData {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string; // API usually returns ISO string
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: "active" | "cancelled";
  category: string;
  image: string;
  organizer: {
    _id: string;
    name: string;
  };
}

export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); 
  
  const user = useUserStore(state => state.user);
  const router = useRouter();
  
  // Local state for booking interaction
  const [ticketCount, setTicketCount] = useState(1);

  // SWR
  const { data: event, isLoading, error } = useSWR<EventData>(`/api/events/${slug}`, async (url: string) => {
    const { data: {data} } = await apiClient.get(url); // Adjust depending on your apiClient structure (axios vs fetch)
    // Based on your log: console.log(data.event)
    return data.event;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Event not found or failed to load.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Derived Logic
  const eventDate = new Date(event.date);
  const isSoldOut = event.availableSeats === 0;
  const isCancelled = event.status === "cancelled";
  // Limit max tickets to 5 or whatever is left
  const maxTickets = Math.min(5, event.availableSeats); 
  const totalPrice = event.price * ticketCount;
 
  // --- Handlers ---
  const handleIncrement = () => {
    if (ticketCount < maxTickets) setTicketCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (ticketCount > 1) setTicketCount(prev => prev - 1);
  };

  // book ticket
  const handleBookTicket = async () => {
    if (!user) {
      toast.error("You must be logged in to book tickets");
      router.push("/login");
      return;
    }

    if (user.isEmailVerified === false) {
      toast.error("You must verify your email to book tickets");
      router.push("/verify-email");
      return;
    }

    if (isSoldOut) {
      toast.error("This event is sold out. You can't book more tickets.");
      return;
    }

    if (isCancelled) {
      toast.error("This event has been cancelled. You can't book tickets.");
      return;
    }

    if (eventDate < new Date()) {
      toast.error("This event has already happened. You can't book tickets.");
      return;
    }
    
    // load razorpay script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }
    
    // create order
    const {data: { data: order } } = await apiClient.post("/api/payments/order", {
      eventId: event._id,
      amount: totalPrice,
      currency: "INR",
      totalTickets: ticketCount
    })
    // console.log("Payment order", order);

    // razorpay options
    const options = getOptions(order.amount, "INR", order.id, user?.name, user?.email);

    // open razorpay
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* 1. Hero Image Section */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-muted">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-black">
                {event.category}
            </Badge>
            {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
          {/* 2. Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title Block */}
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg lg:bg-transparent lg:p-0">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{eventDate.toDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <Separator className="hidden lg:block" />

            {/* Description */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">About this event</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </section>

            {/* Organizer */}
            <Card className="bg-muted/30 border-none">
                <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${event.organizer.name}`} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Hosted by</p>
                        <p className="font-semibold text-lg">{event.organizer.name}</p>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* 3. Right Column: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="shadow-lg border-muted/60 overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4">
                  <CardTitle className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-sm font-normal text-muted-foreground">Price per person</span>
                        <span className="text-2xl font-bold">
                            {event.price === 0 ? "Free" : `₹ ${event.price.toLocaleString()}`}
                        </span>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Event Info Summary */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2 border-dashed">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">{eventDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 border-dashed">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-medium">{eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 border-dashed">
                            <span className="text-muted-foreground">Availability</span>
                            <span className={isSoldOut ? "text-destructive font-bold" : "font-medium"}>
                                {isSoldOut ? "Sold Out" : `${event.availableSeats} seats left`}
                            </span>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    {!isCancelled && !isSoldOut && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Tickets</label>
                            <div className="flex items-center justify-between border rounded-md p-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDecrement} disabled={ticketCount <= 1}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold w-12 text-center">{ticketCount}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleIncrement} disabled={ticketCount >= maxTickets}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {isCancelled && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Cancelled</AlertTitle>
                            <AlertDescription>This event has been cancelled.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 bg-muted/20 p-6 border-t">
                    {!isCancelled && !isSoldOut && (
                        <div className="w-full flex justify-between items-center mb-2">
                             <span className="font-semibold text-muted-foreground">Total</span>
                             <span className="text-xl font-bold">
                                {totalPrice === 0 ? "Free" : `₹ ${totalPrice.toLocaleString()}`}
                             </span>
                        </div>
                    )}

                    <Button 
                        className="w-full h-11 text-base font-semibold shadow-md" 
                        disabled={isCancelled || isSoldOut || eventDate < new Date()}
                        onClick={handleBookTicket}
                    >
                        {isCancelled ? (
                            "Unavailable"
                        ) : isSoldOut ? (
                            "Sold Out"
                        ) : (
                            eventDate < new Date() ? "Event has already done" : <>
                                <Ticket className="mr-2 h-4 w-4" />
                                Book Ticket
                            </>
                        )}
                    </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}