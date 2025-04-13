// lib/supabase-server-auth.ts
import { createServerClient, type CookieOptions, type SupabaseClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"
import { auth } from "@clerk/nextjs/server"
import type { Database } from "@/types/supabase"

/**
 * Creates a Supabase client for server-side operations
 * This function is cached to prevent creating multiple clients
 */
export const createServerSupabaseClient = cache((): SupabaseClient<Database> => {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    // Access cookies synchronously to avoid the error
                    const cookie = cookieStore.get(name)
                    return cookie?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set(name, value, options)
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set(name, "", { ...options, maxAge: 0 })
                },
            },
        },
    )
})

/**
 * Gets an authenticated Supabase client using the Clerk user ID
 * This function checks if the user exists in the Supabase database
 */
export async function getAuthenticatedSupabaseClient(): Promise<SupabaseClient<Database>> {
    const { userId } = auth()
    const supabase = createServerSupabaseClient()

    // Only attempt to get a token if we have a userId
    if (userId) {
        try {
            // Get user from Supabase based on Clerk ID
            // We're just checking if the user exists, not using the data directly
            await supabase.from("users").select("id").eq("clerk_id", userId).single()

            // You can add additional logic here if needed
        } catch (error) {
            console.error("Error getting authenticated Supabase client:", error)
        }
    }

    return supabase
}

