// app/admin/post-job/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getServerSupabaseClient } from "@/lib/supabase-server-auth";
import PostJobClient from "@/components/post-job-client";

export default async function PostJobPage() {
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

    return <PostJobClient userId={userData.id} />;
}