// lib/auth-utils.ts
import { auth } from '@clerk/nextjs';
import { getServerSupabaseClient } from './supabase-server-auth';

// Get the current user's Supabase ID
export async function getCurrentUserId() {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    const supabase = await getServerSupabaseClient();

    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

    return data?.id || null;
}

// Get the current user's role
export async function getCurrentUserRole() {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    const supabase = await getServerSupabaseClient();

    const { data } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', userId)
        .single();

    return data?.role || null;
}

// Check if the current user is an admin
export async function isCurrentUserAdmin() {
    const role = await getCurrentUserRole();
    return role === 'admin';
}