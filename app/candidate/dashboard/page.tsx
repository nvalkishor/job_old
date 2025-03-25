"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

// Sample data
const applications = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    appliedAt: "2 days ago",
    status: "pending",
  },
  {
    id: 2,
    jobTitle: "UX Designer",
    company: "DesignHub",
    appliedAt: "1 week ago",
    status: "reviewing",
  },
  {
    id: 3,
    jobTitle: "Backend Engineer",
    company: "DataSystems",
    appliedAt: "3 days ago",
    status: "rejected",
  },
]

const savedJobs = [
  {
    id: 1,
    title: "Product Manager",
    company: "InnovateCo",
    location: "Chicago, IL",
    savedAt: "1 day ago",
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "AnalyticsPro",
    location: "Boston, MA",
    savedAt: "3 days ago",
  },
]

export default function CandidateDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    // Check if user is logged in and is a candidate
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (userData.role === "candidate") {
          setUser(userData)
          // Check if profile exists (in a real app, this would be from an API)
          setHasProfile(localStorage.getItem("candidateProfile") !== null)
        } else {
          // Redirect non-candidate users
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
          {applications.length > 0 ? (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{application.jobTitle}</CardTitle>
                    <CardDescription>{application.company}</CardDescription>
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
                    <p className="text-sm text-muted-foreground">Applied {application.appliedAt}</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/jobs/${application.id}`}>View Job</Link>
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
          {savedJobs.length > 0 ? (
            savedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    {job.company} • {job.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Saved {job.savedAt}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/jobs/${job.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm">Apply Now</Button>
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

