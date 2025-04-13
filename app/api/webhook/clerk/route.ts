// app/api/webhook/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // Get the webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        return new Response('Missing webhook secret', { status: 500 });
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error verifying webhook', { status: 400 });
    }

    // Get the event type
    const eventType = evt.type;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Handle the different event types
    switch (eventType) {
        case 'user.created': {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const email = email_addresses[0]?.email_address;
            const name = [first_name, last_name].filter(Boolean).join(' ');

            // Check if user already exists in Supabase
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('clerk_id', id)
                .single();

            if (!existingUser) {
                // Create a new user in Supabase
                await supabase.from('users').insert({
                    clerk_id: id,
                    email,
                    name,
                    role: 'candidate', // Default role
                    created_at: new Date().toISOString(),
                });
            }
            break;
        }

        case 'user.updated': {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const email = email_addresses[0]?.email_address;
            const name = [first_name, last_name].filter(Boolean).join(' ');

            // Update the user in Supabase
            await supabase
                .from('users')
                .update({
                    email,
                    name,
                    updated_at: new Date().toISOString(),
                })
                .eq('clerk_id', id);
            break;
        }

        case 'user.deleted': {
            const { id } = evt.data;

            // Delete the user from Supabase
            await supabase
                .from('users')
                .delete()
                .eq('clerk_id', id);
            break;
        }
    }

    return NextResponse.json({ success: true });
}