// app/candidate/dashboard/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getServerSupabaseClient } from "@/lib/supabase-server-auth";
import CandidateDashboardClient from "@/components/candidate-dashboard-client";

export default async function CandidateDashboardPage() {
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

    // Get candidate profile
    const { data: profile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single();

    // Get applications
    const { data: applications } = await supabase
        .from('applications')
        .select(`
      id,
      status,
      created_at,
      job:job_id (
        id,
        title,
        company
      )
    `)
        .eq('candidate_id', userData.id)
        .order('created_at', { ascending: false });

    // Get saved jobs
    const { data: savedJobs } = await supabase
        .from('saved_jobs')
        .select(`
      id,
      created_at,
      job:job_id (
        id,
        title,
        company,
        location
      )
    `)
        .eq('candidate_id', userData.id)
        .order('created_at', { ascending: false });

    return (
        <CandidateDashboardClient
            userId={userData.id}
            hasProfile={!!profile}
            applications={applications || []}
            savedJobs={savedJobs || []}
        />
    );
}