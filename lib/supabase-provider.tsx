// lib/supabase-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@clerk/nextjs";

const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
    const { getToken } = useAuth();
    const [supabase, setSupabase] = useState(null);

    useEffect(() => {
        const initializeClient = async () => {
            const supabaseClient = createClientComponentClient();

            // Get JWT token from Clerk
            const token = await getToken({ template: 'supabase' });

            if (token) {
                // Set the Clerk JWT as the session in Supabase
                await supabaseClient.auth.setSession({
                    access_token: token,
                    refresh_token: token, // In this case, they're the same
                });
            }

            setSupabase(supabaseClient);
        };

        initializeClient();
    }, [getToken]);

    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
}

export function useSupabaseClient() {
    return useContext(SupabaseContext);
}