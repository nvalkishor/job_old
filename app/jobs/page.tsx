///app/jobs/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase-server-auth"
import JobsClientComponent from "@/components/jobs-client"

export default async function JobsPage() {
    // Create the Supabase client
    const supabase = createServerSupabaseClient()

    try {
        // Fetch jobs from Supabase
        const { data: jobs, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching jobs:", error)
        }

        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
                <JobsClientComponent initialJobs={jobs || []} />
            </div>
        )
    } catch (error) {
        console.error("Exception fetching jobs:", error)

        // Return a fallback UI with empty jobs array
        return (
            <div className="container py-10">
                <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
                <JobsClientComponent initialJobs={[]} />
            </div>
        )
    }
}

