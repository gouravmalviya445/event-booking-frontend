"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, IndianRupee, Users, Plus, BarChart3, MapPin, ArrowUpRight } from "lucide-react"
import useSWR from "swr"
import { apiClient } from "@/lib/apiClient"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatCard } from "@/components/StatCard"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Types adapted for Organizer
type OrganizerResponse = {
  totalEvents: number,
  totalRevenue: number,
  totalTicketsSold: number,
  totalActiveEvents: number,
  events: [{
    _id: string,
    title: string,
    date: Date,
    location: string,
    price: number,
    availableSeats: number,
    totalSeats: number,
    status: "active" | "cancelled" | "completed"
  }]
}

export default function OrganizerDashboard() {
  const router = useRouter();
  // Changed endpoint to organizer specific route
  const { data, isLoading, error } = useSWR<OrganizerResponse>("/api/users/organizer", async (url: string) => {
    const { data: { data } } = await apiClient.get(url);
    return data;
  })

  if (error?.response.status === 401) {
    toast.error(error?.response?.data?.message || "Please login to continue");
    router.push("/login");
  } 
  if (error?.response.status === 403) {
    toast.error(error?.response?.data?.message || "You are not authorized to access this page");
    router.push("/");
  } 

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizer Panel</h2>
          <p className="text-muted-foreground mt-1">Manage your events and track performance.</p>
        </div>
        <Link href="/events/create">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Revenue" 
          icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
          value={data?.totalRevenue}
          isCurrency
          isLoading={isLoading}
          subtext="Gross earnings across events"
          bgClass="bg-emerald-50"
          className="ring-emerald-500/40"
        />
        <StatCard 
          title="Tickets Sold" 
          icon={<Users className="h-5 w-5 text-blue-600" />}
          value={data?.totalTicketsSold}
          isLoading={isLoading}
          subtext="Total attendees engaged"
          bgClass="bg-blue-50"
          className="ring-blue-500/40"
        />
        <StatCard 
          title="Active Events" 
          icon={<BarChart3 className="h-5 w-5 text-orange-600" />}
          value={data?.totalActiveEvents}
          isLoading={isLoading}
          subtext="Live on platform"
          bgClass="bg-orange-50"
          className="ring-orange-500/40"
        />
      </div>

      {/* Event Management Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Events</CardTitle>
              <CardDescription>Real-time status of your hosted experiences.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="md:hidden">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableHead className="pl-6">Event Name</TableHead>
                <TableHead>Date & Venue</TableHead>
                <TableHead>Sales Progress</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><div className="h-4 w-48 bg-slate-300 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-200 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !data?.events?.length ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Calendar className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-lg">No events created</p>
                        <p className="text-sm text-muted-foreground">You haven't hosted any events yet.</p>
                      </div>
                      <Link href="/events/create">
                        <Button variant="outline" className="mt-4">Create your first event</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                data.events.map((event) => {
                  const totalTicketsSold = event.totalSeats - event.availableSeats;
                  const percentage = Math.round(( totalTicketsSold / event.totalSeats) * 100);
                  const isFull = totalTicketsSold >= event.totalSeats;
                  
                  return (
                    <TableRow key={event._id} className="group cursor-pointer hover:bg-muted/5 transition-colors">
                      <TableCell className="font-medium pl-6">
                        <div className="flex flex-col">
                           <Link href={`/explore/events/${event._id}`} className="text-base hover:text-blue-500 hover:underline">{event.title}</Link>
                           <span className="text-xs text-muted-foreground font-normal">ID: {event._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-37.5">{event.location}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-35 space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{totalTicketsSold}/{event.totalSeats}</span>
                            <span>{percentage}%</span>
                          </div>
                          {/* Simple Progress Bar */}
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${percentage}%` }} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        {formatCurrency(totalTicketsSold * event.price)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={`
                          ${event.status === 'active' && event.date > new Date()
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                          {event.status === 'active' && event.date > new Date() ? 'Live' : 'Completed'}
                        </Badge>
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