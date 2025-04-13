// app/api/auth/sign-up-trigger/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
    try {
        const { role } = await req.json();
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createRouteHandlerClient({ cookies });

        // Get user details from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        if (!clerkUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const firstName = clerkUser.firstName || '';
        const lastName = clerkUser.lastName || '';
        const name = [firstName, lastName].filter(Boolean).join(' ');

        // Check if user already exists in Supabase
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (existingUser) {
            // Update role if needed
            if (role) {
                await supabase
                    .from('users')
                    .update({ role })
                    .eq('clerk_id', userId);
            }

            return NextResponse.json({
                message: 'User already exists',
                userId: existingUser.id
            });
        }

        // Create new user in Supabase
        const { data, error } = await supabase
            .from('users')
            .insert({
                clerk_id: userId,
                email,
                name,
                role: role || 'candidate', // Default to candidate if not specified
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'User created successfully',
            userId: data.id
        });
    } catch (error) {
        console.error('Error in sign-up trigger:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}