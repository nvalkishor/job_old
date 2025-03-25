"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { UserCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // In a real app, we would fetch the user from an API or context
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (!mounted) return null

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">JobPortal</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/jobs" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Jobs
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Admin
            </Link>
          )}
          {user?.role === "candidate" && (
            <Link
              href="/candidate/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/candidate") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              My Applications
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
                <DropdownMenuSeparator />
                {user.role === "candidate" && (
                  <DropdownMenuItem asChild>
                    <Link href="/candidate/profile">My Profile</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={user.role === "admin" ? "/admin/dashboard" : "/candidate/dashboard"}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

