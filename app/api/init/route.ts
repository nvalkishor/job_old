// app/api/init/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { adminEmail, adminClerkId } = await req.json();

        if (!adminEmail || !adminClerkId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient({ cookies });

        // Check if admin user already exists
        const { data: existingAdmin } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .single();

        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        // Create admin user
        const { data, error } = await supabase
            .from('users')
            .insert({
                clerk_id: adminClerkId,
                email: adminEmail,
                name: 'Admin User',
                role: 'admin',
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating admin:', error);
            return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Admin created successfully', admin: data });
    } catch (error) {
        console.error('Error in init route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}