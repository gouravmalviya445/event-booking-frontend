"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, IndianRupee, ShoppingBag, Ticket, TrendingUp, Clock, AlertCircle } from "lucide-react"
import useSWR from "swr"
import { apiClient } from "@/lib/apiClient"
import { cn } from "@/lib/utils"

// Types
type Response = {
  totalBookings: number,
  totalSpent: number,
  upcomingEvents: number,
  bookings: [{
    _id: string,
    totalPrice: number,
    tickets: number,
    createdAt: Date,
    event: {
      date: Date,
      category: string
      // Note: If your API returns an event title, add it here. 
      // I'm using 'category' as the primary display for now.
    }
  }]
}

// Formatters
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

const formatDate = (date: Date) => 
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function AttendeeDashboard() {
  const { data, isLoading } = useSWR<Response>("/api/users/attendee", async (url: string) => {
    const { data: { data } } = await apiClient.get(url);
    return data;
  })

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your tickets and events.</p>
        </div>
        <Button className="hidden md:flex">Browse Events</Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Purchases" 
          icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          value={data?.totalBookings}
          isLoading={isLoading}
          subtext="Lifetime orders"
          bgClass="bg-blue-50"
          className="ring-blue-500/40"
        />
        <StatCard 
          title="Total Spent" 
          icon={<IndianRupee className="h-5 w-5 text-green-600" />}
          value={data?.totalSpent} 
          isCurrency
          isLoading={isLoading}
          subtext="Invested in experiences"
          bgClass="bg-green-50"
          className="ring-green-500/40"
        />
        <StatCard 
          title="Upcoming Events" 
          icon={<Calendar className="h-5 w-5 text-purple-600" />}
          value={data?.upcomingEvents}
          isLoading={isLoading}
          subtext="Ready to attend"
          bgClass="bg-purple-50"
          className="ring-purple-500/40"
        />
      </div>

      {/* Recent Purchases Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>View details of your recent transactions.</CardDescription>
            </div>
            {/* Mobile Action */}
            <Button size="sm" variant="outline" className="md:hidden">Browse</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableHead className="pl-6">Event Category</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purchased On</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><div className="h-4 w-32 bg-slate-400/70 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-300 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-slate-300 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-300 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-300 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-300 rounded-full animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !data?.bookings?.length ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Ticket className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-lg">No tickets found</p>
                        <p className="text-sm text-muted-foreground">You haven't purchased any tickets yet.</p>
                      </div>
                      <Button variant="outline" className="mt-4">Find Events</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                data?.bookings.map((booking) => {
                  const eventDate = new Date(booking.event.date);
                  const isPast = eventDate < new Date();
                  
                  return (
                    <TableRow key={booking._id} className="group">
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-2">
                           <span className="capitalize">{booking.event.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(booking.event.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Ticket className="w-3 h-3 text-muted-foreground" />
                          <span>{booking.tickets}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.totalPrice)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(booking.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${isPast 
                            ? "bg-slate-100 text-slate-800 border-slate-200" 
                            : "bg-green-100 text-green-800 border-green-200"
                          }`}>
                          {isPast ? "Completed" : "Upcoming"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Reusable Stat Component for cleaner code
function StatCard({ 
  title, 
  icon, 
  value, 
  isLoading, 
  subtext, 
  isCurrency = false,
  bgClass,
  className="",
}: { 
  title: string, 
  icon: React.ReactNode, 
  value?: number, 
  isLoading: boolean, 
  subtext?: string,
  isCurrency?: boolean,
  bgClass?: string
  className?: string
}) {
  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-sm ring-1",
      className 
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgClass}`}>
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-7 w-20 bg-slate-300 animate-pulse rounded-full" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {isCurrency && value ? formatCurrency(value) : value ?? 0}
                </h3>
              </div>
            )}
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}