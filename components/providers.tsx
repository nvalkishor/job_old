// components/providers.tsx
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { SupabaseProvider } from "@/lib/supabase-provider";

export function Providers({ children }) {
    // Make sure to pass the publishable key
    return (
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <SupabaseProvider>{children}</SupabaseProvider>
        </ClerkProvider>
    );
}