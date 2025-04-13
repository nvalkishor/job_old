// app/candidate/profile/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getServerSupabaseClient } from "@/lib/supabase-server-auth";
import CandidateProfileClient from "@/components/candidate-profile-client";

export default async function CandidateProfilePage() {
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

    if (!userData || userData.role !== 'candidate') {
        redirect('/');
    }

    // Get candidate profile if it exists
    const { data: profile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single();

    return <CandidateProfileClient userId={userData.id} existingProfile={profile} />;
}