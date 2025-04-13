"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { useSupabaseClient } from "@/lib/supabase-auth"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

// Define interfaces for the data types
interface Job {
    id: string
    title: string
    company: string
    location: string
    description?: string
    status?: string
}

interface Application {
    id: string
    status: string
    created_at: string
    job: Job
}

interface SavedJob {
    id: string
    created_at: string
    job: Job
}

interface CandidateDashboardClientProps {
    hasProfile: boolean
    applications: Application[]
    savedJobs: SavedJob[]
}

export default function CandidateDashboardClient({
    hasProfile,
    applications,
    savedJobs,
}: CandidateDashboardClientProps) {
    const supabase = useSupabaseClient()
    const [currentApplications] = useState(applications)
    const [currentSavedJobs, setCurrentSavedJobs] = useState(savedJobs)

    // Remove saved job
    const removeSavedJob = async (savedJobId: string) => {
        if (!supabase) return

        const { error } = await supabase.from("saved_jobs").delete().eq("id", savedJobId)

        if (error) {
            toast({
                title: "Error",
                description: "Failed to remove saved job. Please try again.",
                variant: "destructive",
            })
            return
        }

        setCurrentSavedJobs(currentSavedJobs.filter((job) => job.id !== savedJobId))

        toast({
            title: "Job Removed",
            description: "The job has been removed from your saved jobs.",
        })
    }

    return (
        <div className="container py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
                    <p className="text-muted-foreground">Manage your job applications and profile</p>
                </div>
                <div className="flex gap-2">
                    {!hasProfile ? (
                        <Button asChild>
                            <Link href="/candidate/profile">Complete Your Profile</Link>
                        </Button>
                    ) : (
                        <Button variant="outline" asChild>
                            <Link href="/candidate/profile">Edit Profile</Link>
                        </Button>
                    )}
                    <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                </div>
            </div>

            {!hasProfile && (
                <Card className="mb-8 border-dashed bg-muted/50">
                    <CardHeader>
                        <CardTitle>Complete Your Profile</CardTitle>
                        <CardDescription>A complete profile increases your chances of getting hired</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Add your personal information, work experience, and upload your resume to stand out to employers.
                        </p>
                        <Button asChild>
                            <Link href="/candidate/profile">Complete Profile</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="applications" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="applications">My Applications</TabsTrigger>
                    <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="applications" className="space-y-4">
                    {currentApplications.length > 0 ? (
                        currentApplications.map((application) => (
                            <Card key={application.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle>{application.job.title}</CardTitle>
                                        <CardDescription>{application.job.company}</CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            application.status === "pending"
                                                ? "outline"
                                                : application.status === "reviewing"
                                                    ? "secondary"
                                                    : application.status === "rejected"
                                                        ? "destructive"
                                                        : "default"
                                        }
                                    >
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">
                                            Applied {new Date(application.created_at).toLocaleDateString()}
                                        </p>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/jobs/${application.job.id}`}>View Job</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Applications Yet</h3>
                            <p className="mt-2 text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
                            <Button className="mt-4" asChild>
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                    {currentSavedJobs.length > 0 ? (
                        currentSavedJobs.map((savedJob) => (
                            <Card key={savedJob.id}>
                                <CardHeader>
                                    <CardTitle>{savedJob.job.title}</CardTitle>
                                    <CardDescription>
                                        {savedJob.job.company} • {savedJob.job.location}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">
                                            Saved {new Date(savedJob.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => removeSavedJob(savedJob.id)}>
                                                Remove
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/jobs/${savedJob.job.id}`}>View Details</Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <Link href={`/jobs/${savedJob.job.id}`}>Apply Now</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Saved Jobs</h3>
                            <p className="mt-2 text-muted-foreground">You haven&apos;t saved any jobs yet.</p>
                            <Button className="mt-4" asChild>
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

