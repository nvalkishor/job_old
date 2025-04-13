import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// Create a Supabase client that uses Clerk's JWT
export function useSupabaseClient() {
    const { getToken } = useAuth();
    const [supabaseClient, setSupabaseClient] = useState(null);

    useEffect(() => {
        const initializeClient = async () => {
            const supabase = createClientComponentClient();

            // Get JWT token from Clerk
            const token = await getToken({ template: 'supabase' });

            if (token) {
                // Set the Clerk JWT as the session in Supabase
                const { error } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: token, // In this case, they're the same
                });

                if (error) {
                    console.error('Error setting Supabase session:', error);
                }
            }

            setSupabaseClient(supabase);
        };

        initializeClient();
    }, [getToken]);

    return supabaseClient;
}