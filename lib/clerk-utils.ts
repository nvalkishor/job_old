import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/supabase";

export async function getCurrentUser() {
    const user = await currentUser();
    if (!user) return null;

    return user;
}

export async function ensureUserInDatabase() {
    const user = await currentUser();
    if (!user) return null;

    // Check if user exists in our database
    const { data: existingUser } = await db
        .from('users')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

    if (existingUser) return existingUser;

    // If not, create the user
    const { data: newUser, error } = await db
        .from('users')
        .insert({
            id: crypto.randomUUID(),
            clerk_id: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName || ''}`.trim(),
            role: 'candidate', // Default role
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user:', error);
        return null;
    }

    return newUser;
}