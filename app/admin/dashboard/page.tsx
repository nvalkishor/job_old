"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building, FileText, Users, UserPlus } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Define interfaces for the data types
interface User {
    id: string
    clerk_id: string
    name: string
    email: string
    role: string
    created_at: string
}

interface Job {
    id: string
    title: string
    description: string
    company: string
    location: string
    salary: string
    status: string
    created_at: string
    application_count?: number
}

interface Application {
    id: string
    status: string
    created_at: string
    jobs?: {
        id: string
        title: string
    }
    users?: {
        id: string
        name: string
    }
}

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState({
        jobCount: 0,
        applicationCount: 0,
        userCount: 0,
        adminCount: 0,
        candidateCount: 0,
        invitationCount: 0,
    })
    const [postedJobs, setPostedJobs] = useState<Job[]>([])
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClientComponentClient<Database>()

                // Check if user is logged in and is an admin
                const {
                    data: { session },
                } = await supabase.auth.getSession()

                if (!session) {
                    router.push("/auth/login")
                    return
                }

                // Get user data
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("clerk_id", session.user.id)
                    .single()

                if (userError || !userData || userData.role !== "admin") {
                    router.push("/")
                    return
                }

                setUser(userData)

                // Fetch stats
                const [
                    { count: jobCount },
                    { count: applicationCount },
                    { count: userCount },
                    { count: adminCount },
                    { count: invitationCount },
                ] = await Promise.all([
                    supabase.from("jobs").select("*", { count: "exact", head: true }),
                    supabase.from("applications").select("*", { count: "exact", head: true }),
                    supabase.from("users").select("*", { count: "exact", head: true }),
                    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "admin"),
                    supabase.from("admin_invitations").select("*", { count: "exact", head: true }).eq("status", "pending"),
                ])

                setStats({
                    jobCount: jobCount || 0,
                    applicationCount: applicationCount || 0,
                    userCount: userCount || 0,
                    adminCount: adminCount || 0,
                    candidateCount: (userCount || 0) - (adminCount || 0),
                    invitationCount: invitationCount || 0,
                })

                // Fetch jobs
                const { data: jobs } = await supabase
                    .from("jobs")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(5)

                setPostedJobs(jobs || [])

                // Fetch applications
                const { data: apps } = await supabase
                    .from("applications")
                    .select(`
            id,
            status,
            created_at,
            jobs (
              id,
              title
            ),
            users:candidate_id (
              id,
              name
            )
          `)
                    .order("created_at", { ascending: false })
                    .limit(5)

                setApplications(apps || [])
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    if (loading) {
        return <div className="container py-10">Loading...</div>
    }

    if (!user) {
        return null // Redirect handled in useEffect
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your job postings, applications, and users</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/admin/post-job">Post New Job</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/auth/invite">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Admin
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.jobCount}</div>
                        <p className="text-xs text-muted-foreground">Active job postings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.applicationCount}</div>
                        <p className="text-xs text-muted-foreground">Total applications received</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.userCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.adminCount} admins, {stats.candidateCount} candidates
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.invitationCount}</div>
                        <p className="text-xs text-muted-foreground">Admin invitations pending</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="jobs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-4">
                    {postedJobs.length > 0 ? (
                        postedJobs.map((job) => (
                            <Card key={job.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle>{job.title}</CardTitle>
                                        <CardDescription>Posted {new Date(job.created_at).toLocaleDateString()}</CardDescription>
                                    </div>
                                    <Badge variant={job.status === "active" ? "default" : "secondary"}>
                                        {job.status === "active" ? "Active" : "Closed"}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-medium">{job.application_count || 0}</span> applications received
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/jobs/${job.id}`}>View Details</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/jobs/${job.id}/edit`}>Edit</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                                <Button asChild>
                                    <Link href="/admin/post-job">Post Your First Job</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="applications" className="space-y-4">
                    {applications.length > 0 ? (
                        applications.map((application) => (
                            <Card key={application.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle>{application.users?.name || "Candidate"}</CardTitle>
                                        <CardDescription>Applied for {application.jobs?.title || "Job"}</CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            application.status === "pending"
                                                ? "outline"
                                                : application.status === "reviewing"
                                                    ? "secondary"
                                                    : application.status === "interviewing"
                                                        ? "default"
                                                        : "outline"
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
                                        <Button size="sm" asChild>
                                            <Link href={`/admin/applications/${application.id}`}>Review</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No applications received yet</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Manage system users and administrator access</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="bg-muted rounded-lg p-4">
                                        <h3 className="font-medium mb-2">Registered Users</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            View and manage all users registered in the system.
                                        </p>
                                        <Button asChild>
                                            <Link href="/admin/users">Manage Users</Link>
                                        </Button>
                                    </div>

                                    <div className="bg-muted rounded-lg p-4">
                                        <h3 className="font-medium mb-2">Admin Invitations</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Invite new administrators to help manage the platform.
                                        </p>
                                        <Button asChild>
                                            <Link href="/admin/auth/invite">Invite Admin</Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Recent User Activity</h3>
                                    <div className="text-sm text-muted-foreground">
                                        {stats.userCount > 0 ? (
                                            <p>
                                                There are currently {stats.userCount} users in the system, including {stats.adminCount}{" "}
                                                administrators.
                                            </p>
                                        ) : (
                                            <p>No users have been registered yet.</p>
                                        )}
                                        {stats.invitationCount > 0 && (
                                            <p className="mt-1">There are {stats.invitationCount} pending admin invitations.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

