"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Building, Calendar, Clock, MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Sample job data - in a real app, this would come from an API
const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    postedAt: "2 days ago",
    description:
      "We are looking for a skilled Frontend Developer to join our team. The ideal candidate should have experience with React, TypeScript, and modern CSS frameworks.",
    requirements: [
      "3+ years of experience with React",
      "Strong knowledge of TypeScript",
      "Experience with CSS frameworks like Tailwind",
      "Understanding of responsive design principles",
      "Familiarity with version control systems (Git)",
    ],
    responsibilities: [
      "Develop and maintain user interfaces for web applications",
      "Collaborate with designers to implement UI/UX designs",
      "Write clean, maintainable, and efficient code",
      "Optimize applications for maximum speed and scalability",
      "Participate in code reviews and team discussions",
    ],
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignHub",
    location: "New York, NY",
    type: "Contract",
    salary: "$70 - $90 per hour",
    postedAt: "1 week ago",
    description:
      "DesignHub is seeking a talented UX Designer to create exceptional user experiences for our clients. You will work closely with our product and development teams to design intuitive and engaging interfaces.",
    requirements: [
      "4+ years of experience in UX/UI design",
      "Proficiency with design tools like Figma and Adobe XD",
      "Portfolio demonstrating strong UX design skills",
      "Experience conducting user research and usability testing",
      "Strong communication and collaboration skills",
    ],
    responsibilities: [
      "Create wireframes, prototypes, and user flows",
      "Conduct user research and analyze user feedback",
      "Collaborate with developers to ensure design implementation",
      "Create and maintain design systems",
      "Stay updated on UX trends and best practices",
    ],
  },
  // Add more job data for other IDs
]

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const jobId = Number.parseInt(params.id)
  const job = jobs.find((j) => j.id === jobId)

  const [coverLetter, setCoverLetter] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (!job) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="mb-6">The job you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/jobs">Browse All Jobs</Link>
        </Button>
      </div>
    )
  }

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or register to apply for this job.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (user.role !== "candidate") {
      toast({
        title: "Not Allowed",
        description: "Only candidates can apply for jobs.",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would submit this to an API
    toast({
      title: "Application Submitted",
      description: "Your application has been submitted successfully.",
    })

    router.push("/candidate/dashboard")
  }

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
                  <span>Posted {job.postedAt}</span>
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
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {job.responsibilities.map((resp, index) => (
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
              <Button onClick={handleApply} className="w-full">
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

