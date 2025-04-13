//components/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase-auth";

export default function Header() {
    const pathname = usePathname();
    const { isLoaded, isSignedIn, user } = useUser();
    const supabase = useSupabaseClient();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        async function getUserRole() {
            if (!isSignedIn || !user || !supabase) return;

            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('clerk_id', user.id)
                .single();

            if (data) {
                setUserRole(data.role);
            }
        }

        getUserRole();
    }, [isSignedIn, user, supabase]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold">JobPortal</span>
                </Link>
                <nav className="hidden md:flex gap-6">
                    <Link
                        href="/"
                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/jobs"
                        className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/jobs" ? "text-primary" : "text-muted-foreground"
                            }`}
                    >
                        Jobs
                    </Link>
                    {userRole === "admin" && (
                        <Link
                            href="/admin/dashboard"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            Admin
                        </Link>
                    )}
                    {userRole === "candidate" && (
                        <Link
                            href="/candidate/dashboard"
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith("/candidate") ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            My Applications
                        </Link>
                    )}
                </nav>
                <div className="flex items-center gap-2">
                    {isLoaded && isSignedIn ? (
                        <UserButton afterSignOutUrl="/" />
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
    );
}