// components/jobs-client.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, MapPin, Search, SortAsc, SortDesc, X } from "lucide-react"
import { useSupabaseClient } from "@/lib/supabase-provider"

// Define interface for job data
interface Job {
    id: string
    title: string
    company: string
    location: string
    type: string
    status: string
    created_at: string
    updated_at?: string
    description?: string
    requirements?: string
    responsibilities?: string
    salary?: string
}

// Define props interface
interface JobsClientComponentProps {
    initialJobs: Job[]
}

export default function JobsClientComponent({ initialJobs }: JobsClientComponentProps) {
    const supabase = useSupabaseClient()
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOrder, setSortOrder] = useState("desc")
    const [filteredJobs, setFilteredJobs] = useState(initialJobs)
    const [jobs, setJobs] = useState(initialJobs)
    const [isSearching, setIsSearching] = useState(false)

    // Apply filters based on search term
    const applyFilters = useCallback(
        (jobsToFilter: Job[]) => {
            if (!searchTerm.trim()) {
                setFilteredJobs(jobsToFilter)
                return
            }

            const term = searchTerm.toLowerCase()
            const results = jobsToFilter.filter(
                (job) =>
                    job.title.toLowerCase().includes(term) ||
                    job.company.toLowerCase().includes(term) ||
                    job.location.toLowerCase().includes(term) ||
                    job.type.toLowerCase().includes(term),
            )

            setFilteredJobs(results)
        },
        [searchTerm],
    )

    // Refetch jobs when supabase client is available
    useEffect(() => {
        async function fetchJobs() {
            if (!supabase) return

            try {
                const { data } = await supabase
                    .from("jobs")
                    .select("*")
                    .eq("status", "active")
                    .order("created_at", { ascending: sortOrder === "asc" })

                if (data) {
                    setJobs(data)
                    applyFilters(data)
                }
            } catch (error) {
                console.error("Error fetching jobs:", error)
            }
        }

        fetchJobs()
    }, [supabase, sortOrder, applyFilters])

    // Handle search
    const handleSearch = async () => {
        setIsSearching(true)

        try {
            // First apply client-side filtering
            applyFilters(jobs)

            // Then try to fetch from server if supabase is available
            if (supabase && searchTerm.trim()) {
                const { data } = await supabase
                    .from("jobs")
                    .select("*")
                    .eq("status", "active")
                    .or(
                        `title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`,
                    )
                    .order("created_at", { ascending: sortOrder === "asc" })

                if (data) {
                    setJobs(data)
                    setFilteredJobs(data)
                }
            }
        } catch (error) {
            console.error("Error searching jobs:", error)
            // Fallback to client-side filtering
            applyFilters(jobs)
        } finally {
            setIsSearching(false)
        }
    }

    // Toggle sort order
    const toggleSortOrder = async () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc"
        setSortOrder(newOrder)

        if (supabase) {
            try {
                const { data } = await supabase
                    .from("jobs")
                    .select("*")
                    .eq("status", "active")
                    .order("created_at", { ascending: newOrder === "asc" })

                if (data) {
                    setJobs(data)
                    applyFilters(data)
                }
            } catch (error) {
                console.error("Error sorting jobs:", error)
            }
        }
    }

    // Clear search
    const clearSearch = () => {
        setSearchTerm("")
        setFilteredJobs(jobs)
    }

    return (
        <>
            {/* Search UI */}
            <div className="bg-card rounded-lg p-6 mb-8 border">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div>
                        <Label htmlFor="search">Search Jobs</Label>
                        <div className="relative mt-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search by job title, company, location, or job type..."
                                className="pl-8 pr-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute right-2.5 top-2.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                                    onClick={clearSearch}
                                    type="button"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3 w-3 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-end">
                        <Button className="h-10" onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? "Searching..." : "Search Jobs"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">{filteredJobs.length} jobs found</div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="sort" className="text-sm whitespace-nowrap">
                        Sort by date:
                    </Label>
                    <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={toggleSortOrder}>
                        {sortOrder === "asc" ? (
                            <>
                                <SortAsc className="h-4 w-4" />
                                <span>Oldest first</span>
                            </>
                        ) : (
                            <>
                                <SortDesc className="h-4 w-4" />
                                <span>Newest first</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Job Listings */}
            {filteredJobs.length > 0 ? (
                <div className="grid gap-6">
                    {filteredJobs.map((job) => (
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
                                    <div className="text-muted-foreground">Posted {new Date(job.created_at).toLocaleDateString()}</div>
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
            ) : (
                <div className="text-center py-12 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
                    <Button onClick={clearSearch}>Clear Search</Button>
                </div>
            )}
        </>
    )
}

