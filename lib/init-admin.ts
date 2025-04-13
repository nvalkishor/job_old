// lib/init-admin.ts
import { db } from "@/lib/supabase";

export async function initializeAdminAccount() {
    // Check if admin exists
    const { data: existingAdmin } = await db
        .from('users')
        .select('id')
        .eq('email', 'testadmin@jobportal.com')
        .single();

    if (existingAdmin) return;

    // Create admin user
    const { error } = await db
        .from('users')
        .insert({
            id: crypto.randomUUID(),
            clerk_id: 'admin-default', // This will be updated when the admin signs up with Clerk
            email: 'testadmin@jobportal.com',
            name: 'Test Admin',
            role: 'admin',
        });

    if (error) {
        console.error('Error creating admin account:', error);
    }
}