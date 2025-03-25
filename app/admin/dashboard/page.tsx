"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building, FileText, Users } from "lucide-react"

// Sample data
const postedJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    applications: 12,
    postedAt: "2 days ago",
    status: "active",
  },
  {
    id: 2,
    title: "UX Designer",
    applications: 8,
    postedAt: "1 week ago",
    status: "active",
  },
  {
    id: 3,
    title: "Backend Engineer",
    applications: 5,
    postedAt: "3 days ago",
    status: "active",
  },
]

const applications = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    candidate: "John Smith",
    appliedAt: "1 day ago",
    status: "pending",
  },
  {
    id: 2,
    jobTitle: "Frontend Developer",
    candidate: "Sarah Johnson",
    appliedAt: "2 days ago",
    status: "reviewing",
  },
  {
    id: 3,
    jobTitle: "UX Designer",
    candidate: "Michael Brown",
    appliedAt: "3 days ago",
    status: "interviewing",
  },
  {
    id: 4,
    jobTitle: "Backend Engineer",
    candidate: "Emily Davis",
    appliedAt: "1 day ago",
    status: "pending",
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (userData.role === "admin") {
          setUser(userData)
        } else {
          // Redirect non-admin users
          router.push("/")
        }
      } else {
        // Redirect unauthenticated users
        router.push("/auth/login")
      }
    }
  }, [router])

  if (!user) {
    return null // Loading state
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and applications</p>
        </div>
        <Button asChild>
          <Link href="/admin/post-job">Post New Job</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postedJobs.length}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">Total applications received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.filter((app) => app.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Applications awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {postedJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>Posted {job.postedAt}</CardDescription>
                </div>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status === "active" ? "Active" : "Closed"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{job.applications}</span> applications received
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
          ))}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{application.candidate}</CardTitle>
                  <CardDescription>Applied for {application.jobTitle}</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Applied {application.appliedAt}</p>
                  <Button size="sm" asChild>
                    <Link href={`/admin/applications/${application.id}`}>Review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

