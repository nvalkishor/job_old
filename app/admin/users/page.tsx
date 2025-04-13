// app/admin/users/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getServerSupabaseClient } from "@/lib/supabase-server-auth";
import AdminUsersClient from "@/components/admin-users-client";

export default async function AdminUsersPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/auth/login');
    }

    const supabase = await getServerSupabaseClient();

    // Get user data from Supabase
    const { data: userData } = await supabase
        .from('users')
        .select('id, role')
        .eq('clerk_id', user.id)
        .single();

    if (!userData || userData.role !== 'admin') {
        redirect('/');
    }

    // Get all users
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    // Get all invitations
    const { data: invitations } = await supabase
        .from('admin_invitations')
        .select(`
      id,
      email,
      token,
      created_by,
      created_at,
      expires_at,
      status,
      creator:created_by(name, email)
    `)
        .order('created_at', { ascending: false });

    return (
        <AdminUsersClient
            adminId={userData.id}
            users={users || []}
            invitations={invitations || []}
        />
    );
}