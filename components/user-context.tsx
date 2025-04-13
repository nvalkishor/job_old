// components/user-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/supabase-auth";

type UserContextType = {
    userId: string | null;
    userRole: string | null;
    isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
    userId: null,
    userRole: null,
    isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn, user } = useUser();
    const supabase = useSupabaseClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            if (!isLoaded || !isSignedIn || !user || !supabase) {
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await supabase
                    .from('users')
                    .select('id, role')
                    .eq('clerk_id', user.id)
                    .single();

                if (data) {
                    setUserId(data.id);
                    setUserRole(data.role);
                } else {
                    // User exists in Clerk but not in Supabase, create them
                    const response = await fetch('/api/auth/sign-up-trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: 'candidate' }),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        setUserId(result.userId);
                        setUserRole('candidate');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, [isLoaded, isSignedIn, user, supabase]);

    return (
        <UserContext.Provider value={{ userId, userRole, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}