"use client";

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useUserStore } from '@/store/userStore';
import { LayoutDashboard, LogOut, Menu } from 'lucide-react'; // Added Menu icon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components

const NAV_ITEMS = [
  {
    label: "Browse Events",
    href: "/explore/events",
  },
]

export function Navbar() {
  const { verifyAuth, isLoggedIn, user, logoutUser } = useUserStore();
  const path = usePathname();

  useEffect(() => {
    const verify = async () => {
      if (isLoggedIn) {
        const fiveMinutes = 5 * 60 * 1000;
        const lastVerified = useUserStore.getState().lastVerified;
        // check if lastVerified is a string or Date object to avoid errors
        const lastVerifiedDate = lastVerified ? new Date(lastVerified) : null;
        
        const shouldReverify = !lastVerifiedDate || (Date.now() - lastVerifiedDate.getTime() > fiveMinutes);
        console.log("shouldReverify", shouldReverify)

        if (shouldReverify) {
          await verifyAuth();
        }
      }
    };

    verify().then(() => console.log("Verified Auth"));
  }, [])

  return (
    <nav className="bg-white border rounded-xl shadow-xl border-gray-400 sticky my-4 top-0 z-50 px-4">
      <div className="mx-auto">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
              Gatherly
            </Link>
          </div>

          {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
          <div className="hidden md:flex">
            {NAV_ITEMS.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button
                  variant="link"
                  className={cn(
                    "text-base",
                    path === item.href && "bg-muted font-bold"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {isLoggedIn && (
              <Link href={"/dashboard"}>
                <Button
                  variant="link"
                  className={cn(
                    "text-base",
                    path === "dashboard" && "bg-muted font-bold"
                  )}
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          <MobileNav />

        </div>
      </div>
    </nav>
  );
};

function MobileNav() {
  const { isLoggedIn, user, logoutUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false); // State to control mobile menu
  const path = usePathname();
  const router = useRouter();

  return (
    <>
      {/* --- DESKTOP AUTH BUTTONS (Hidden on Mobile) --- */}
      <div className="hidden md:flex items-center gap-4">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild >
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-black/20 rounded-md shadow-lg">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">Role: {user?.role}</p>
              </div>
              <DropdownMenuSeparator className='bg-black/20 dark:bg-white/20' />
              <DropdownMenuItem asChild>
                <Link href={"/dashboard"} className="flex items-center gap-2 cursor-pointer">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-black/20 dark:bg-white/20' />
              <DropdownMenuItem
                onClick={() => {
                  logoutUser();
                  router.push("/login")
                }}
                className="flex items-center gap-2 cursor-pointer text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="bg-transparent dark:text-white text-black font-semibold border border-black/30 hover:bg-black/10 dark:hover:bg-white/10 dark:hover:text-black transition"
              >Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        )}
      </div>

      {/* --- MOBILE MENU (Visible only on Mobile) --- */}
      <div className="md:hidden flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-blue-600 font-bold text-xl">Gatherly</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-4">
              {/* Mobile Nav Links */}
              <div className="flex flex-col space-y-3">
                {NAV_ITEMS.map((item) => (
                  <Link 
                    href={item.href} 
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-base",
                        path === item.href && "bg-muted font-bold"
                      )}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                {isLoggedIn && (
                  <Link href={"/dashboard"}>
                    <Button
                      variant="link"
                      className={cn(
                        "w-full justify-start text-base",
                        path === "dashboard" && "bg-muted font-bold"
                      )}
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>

              <div className="h-px bg-black/20 my-2" />

              {/* Mobile Auth Section */}
              {isLoggedIn ? (
                <div className="flex flex-col space-y-4">
                  <div className="px-2 py-1.5 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">Role: {user?.role}</p>
                  </div>
                  
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      logoutUser();
                      setIsOpen(false);
                      router.push("/login");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}