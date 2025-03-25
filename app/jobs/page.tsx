import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, MapPin, Search } from "lucide-react"

// Sample job data
const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    postedAt: "2 days ago",
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignHub",
    location: "New York, NY",
    type: "Contract",
    postedAt: "1 week ago",
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "DataSystems",
    location: "Remote",
    type: "Full-time",
    postedAt: "3 days ago",
  },
  {
    id: 4,
    title: "Product Manager",
    company: "InnovateCo",
    location: "Chicago, IL",
    type: "Full-time",
    postedAt: "5 days ago",
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "AnalyticsPro",
    location: "Boston, MA",
    type: "Part-time",
    postedAt: "1 day ago",
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Remote",
    type: "Full-time",
    postedAt: "3 days ago",
  },
]

export default function JobsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>

      {/* Search and Filter */}
      <div className="bg-card rounded-lg p-6 mb-8 border">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="search" placeholder="Job title or keyword" className="pl-8" />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="City or Remote" className="mt-1" />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Search Jobs</Button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <Badge variant="outline">{job.type}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="text-muted-foreground">Posted {job.postedAt}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/jobs/${job.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

