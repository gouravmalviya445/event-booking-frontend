"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiClient } from "@/lib/apiClient"
import { formatDate } from "@/lib/utils"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, 
  ShieldCheck, 
  Shield, 
  UserCog, 
  IndianRupee, 
  ShoppingBag, 
  Trash2,
  Mail
} from "lucide-react"
import Link from "next/link"
import { useUserStore } from "@/store/userStore"

type AdminUser = {
  _id: string
  name: string
  email: string
  role: "attendee" | "admin" | "organizer"
  isEmailVerified: boolean
  createdAt: Date
}

type AdminResponse = {
  users: AdminUser[]
  totalUsers: number
  totalVerifiedUsers: number
  totalAdmins: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const user = useUserStore(state => state.user)

  // fetch admin dashboard data
  const { data, isLoading, error, mutate } = useSWR<AdminResponse>("/api/users", async (url: string) => {
    const { data: { data } } = await apiClient.get(url)
    return data
  })

  // fetch all bookings
  const { data: bookingResponse } =
    useSWR<{ totalEarnings: number, totalPurchases: number }>("/api/bookings", async (url: string) => {
      const { data: { data } } = await apiClient.get(url)
      return data
    })

  if (error?.response?.status === 401) {
    toast.error(error?.response?.data?.message || "Please login to continue")
    router.push("/login")
  }
  if (error?.response?.status === 403) {
    toast.error(error?.response?.data?.message || "You are not authorized to access this page")
    router.push("/")
  }

  const totals = useMemo(() => {
    const users = data?.users ?? []
    const totalOrganizers = users.filter(u => u.role === "organizer").length
    return {
      totalUsers: data?.totalUsers ?? 0,
      totalVerifiedUsers: data?.totalVerifiedUsers ?? 0,
      totalAdmins: data?.totalAdmins ?? 0,
      totalOrganizers,
    }
  }, [data])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this user? This cannot be undone.")
    if (!confirmed) return
    try {
      setDeletingId(id)
      await apiClient.delete(`/api/users/${id}`)
      toast.success("User deleted successfully")
      mutate()
    } catch (deleteError: any) {
      toast.error(deleteError?.response?.data?.message || "Failed to delete user")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto relative">
      {user?.isEmailVerified == false && (
        <Button variant="secondary" className="flex border border-black/20 text-xs gap-2 py-2 px-3 absolute top-0 right-4">
          <Link href="/verify-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            Verify Your Email
          </Link>
        </Button>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track platform performance and manage users.</p>
        </div>
        <Badge variant="outline" className="hidden md:flex gap-2 py-2 px-3">
          <Shield className="h-4 w-4 text-blue-600" />
          Admin Access
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          icon={<Users className="h-5 w-5 text-blue-600" />}
          value={totals.totalUsers}
          isLoading={isLoading}
          subtext="All registered accounts"
          bgClass="bg-blue-50"
          className="ring-blue-500/40"
        />
        <StatCard
          title="Verified Users"
          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          value={totals.totalVerifiedUsers}
          isLoading={isLoading}
          subtext="Email verified"
          bgClass="bg-emerald-50"
          className="ring-emerald-500/40"
        />
        <StatCard
          title="Organizers"
          icon={<UserCog className="h-5 w-5 text-orange-600" />}
          value={totals.totalOrganizers}
          isLoading={isLoading}
          subtext="Event creators"
          bgClass="bg-orange-50"
          className="ring-orange-500/40"
        />
        <StatCard
          title="Admins"
          icon={<Shield className="h-5 w-5 text-slate-700" />}
          value={totals.totalAdmins}
          isLoading={isLoading}
          subtext="Platform managers"
          bgClass="bg-slate-100"
          className="ring-slate-400/50"
        />
      </div>

      {/* Purchase Overview */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchasing Overview</CardTitle>
              <CardDescription>High-level purchasing metrics for the platform.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold tracking-tight">{bookingResponse?.totalEarnings || 0}</p>
                <p className="text-xs text-muted-foreground">Connect bookings analytics to populate</p>
              </div>
            </div>
            <div className="rounded-xl border p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold tracking-tight">{bookingResponse?.totalPurchases || 0}</p>
                <p className="text-xs text-muted-foreground">Available once booking stats are exposed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Review accounts and manage access.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="md:hidden">Manage</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <div className="h-4 w-40 bg-slate-300 animate-pulse rounded" />
                    </TableCell>
                    <TableCell><div className="h-4 w-44 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-200 animate-pulse rounded" /></TableCell>
                    <TableCell className="pr-6">
                      <div className="h-7 w-20 bg-slate-200 animate-pulse rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !data?.users?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                data.users.map(user => (
                  <TableRow key={user._id} className="group hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-sm">
                            {user.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">ID: {user._id.toUpperCase()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : user.role === "organizer"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.isEmailVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === user._id}
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingId === user._id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
