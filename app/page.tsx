import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Building, MapPin, AlertCircle } from 'lucide-react';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function Home() {
    // Create a Supabase client with properly awaited cookies
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({
        cookies: () => cookieStore
    })

    // Initialize variables for error handling
    let featuredJobs = null
    let fetchError = null

    try {
        console.log("Fetching featured jobs...")
        // Fetch featured jobs
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(3)

        if (error) {
            console.error("Error fetching jobs:", error)
            fetchError = error.message
        } else {
            console.log("Featured jobs fetched successfully:", data?.length || 0)
            featuredJobs = data
        }
    } catch (error) {
        console.error("Exception while fetching jobs:", error)
        fetchError = error instanceof Error ? error.message : "An unknown error occurred"
    }

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-20">
                <div className="container">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Find Your Perfect <span className="text-primary">Job Match</span>
                        </h1>
                        <p className="mt-6 text-xl text-muted-foreground">
                            Connect with top employers and discover opportunities that align with your skills and career goals.
                        </p>
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <Button size="lg" asChild>
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/sign-up">Create Account</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Jobs Section */}
            <section className="py-16">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold tracking-tight">Featured Jobs</h2>
                        <Button variant="ghost" asChild>
                            <Link href="/jobs" className="flex items-center gap-2">
                                View all jobs <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Error Alert */}
                    {fetchError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                There was a problem loading the featured jobs: {fetchError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {!fetchError && featuredJobs && featuredJobs.length > 0 ? (
                            featuredJobs.map((job) => (
                                <Card key={job.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-xl">{job.title}</CardTitle>
                                            <Badge variant="outline">{job.type}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span>{job.company}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                <span>Posted {new Date(job.created_at || '').toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                            <Link href={`/jobs/${job.id}`}>View Details</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10">
                                <p className="text-muted-foreground">
                                    {fetchError
                                        ? "Unable to load jobs at this time. Please try again later."
                                        : "No featured jobs available at the moment."}
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link href="/jobs">Browse All Jobs</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-muted py-16">
                <div className="container">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-12">How It Works</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
                            <p className="text-muted-foreground">
                                Register as a candidate to apply for jobs or as an admin to post job openings.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
                            <p className="text-muted-foreground">
                                Add your details and upload your resume to stand out to potential employers.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Apply for Jobs</h3>
                            <p className="text-muted-foreground">
                                Browse listings and apply for positions that match your skills and interests.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}