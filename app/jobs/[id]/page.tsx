// app/jobs/[id]/page.tsx (Server Component)
import { createServerSupabaseClient } from "@/lib/supabase-server-auth"
import JobDetailsClient from "@/components/job-details-client"
import { notFound } from "next/navigation"

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createServerSupabaseClient()

    // Fetch job details
    const { data: job, error } = await supabase.from("jobs").select("*").eq("id", params.id).single()

    if (error || !job) {
        notFound()
    }

    return <JobDetailsClient job={job} />
}

