// components/job-details-client.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Building, Calendar, Clock, MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { useSupabaseClient } from "@/lib/supabase-auth"
import { useState, useEffect } from "react"

// Define interface for job data
interface Job {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string
    description: string
    requirements: string
    responsibilities: string
    status: string
    created_at: string
    updated_at?: string
}

// Define props interface
interface JobDetailsClientProps {
    job: Job
}

export default function JobDetailsClient({ job }: JobDetailsClientProps) {
    const router = useRouter()
    const { isSignedIn, user } = useUser()
    const supabase = useSupabaseClient()
    const [coverLetter, setCoverLetter] = useState("")
    const [userRole, setUserRole] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Get user role and ID from Supabase
    useEffect(() => {
        async function getUserData() {
            if (!isSignedIn || !user || !supabase) return

            const { data } = await supabase.from("users").select("id, role").eq("clerk_id", user.id).single()

            if (data) {
                setUserRole(data.role)
                setUserId(data.id)
            }
        }

        getUserData()
    }, [isSignedIn, user, supabase])

    const handleApply = async () => {
        if (!isSignedIn) {
            toast({
                title: "Login Required",
                description: "Please login or register to apply for this job.",
                variant: "destructive",
            })
            router.push("/auth/login")
            return
        }

        if (userRole !== "candidate") {
            toast({
                title: "Not Allowed",
                description: "Only candidates can apply for jobs.",
                variant: "destructive",
            })
            return
        }

        if (!supabase || !userId) {
            toast({
                title: "Error",
                description: "Unable to submit application. Please try again.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        // Check if already applied
        const { data: existingApplication } = await supabase
            .from("applications")
            .select("id")
            .eq("job_id", job.id)
            .eq("candidate_id", userId)
            .single()

        if (existingApplication) {
            toast({
                title: "Already Applied",
                description: "You have already applied for this job.",
                variant: "destructive",
            })
            setIsSubmitting(false)
            return
        }

        // Submit application
        const { error } = await supabase.from("applications").insert({
            job_id: job.id,
            candidate_id: userId,
            cover_letter: coverLetter,
            status: "pending",
        })

        setIsSubmitting(false)

        if (error) {
            toast({
                title: "Error",
                description: "Failed to submit application. Please try again.",
                variant: "destructive",
            })
            return
        }

        toast({
            title: "Application Submitted",
            description: "Your application has been submitted successfully.",
        })

        router.push("/candidate/dashboard")
    }

    // Parse requirements and responsibilities from strings to arrays
    const requirements = job.requirements.split("\n").filter((item) => item.trim())
    const responsibilities = job.responsibilities.split("\n").filter((item) => item.trim())

    return (
        <div className="container py-10">
            <Link href="/jobs" className="text-primary hover:underline mb-6 inline-block">
                ← Back to Jobs
            </Link>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                                    <CardDescription className="flex items-center mt-2">
                                        <Building className="h-4 w-4 mr-2" />
                                        {job.company}
                                    </CardDescription>
                                </div>
                                <Badge className="w-fit">{job.type}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{job.salary}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                                <p>{job.description}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    {requirements.map((req, index) => (
                                        <li key={index}>{req}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Responsibilities</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    {responsibilities.map((resp, index) => (
                                        <li key={index}>{resp}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Apply for this position</CardTitle>
                            <CardDescription>
                                Submit your application for {job.title} at {job.company}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cover Letter (Optional)</label>
                                    <Textarea
                                        placeholder="Tell us why you're a good fit for this position..."
                                        className="min-h-[150px]"
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleApply} className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Apply Now"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

