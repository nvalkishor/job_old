// components/post-job-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseClient } from "@/lib/supabase-auth";

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Job title must be at least 5 characters.",
    }),
    company: z.string().min(2, {
        message: "Company name is required.",
    }),
    location: z.string().min(2, {
        message: "Location is required.",
    }),
    type: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Remote"]),
    salary: z.string().min(2, {
        message: "Salary range is required.",
    }),
    description: z.string().min(50, {
        message: "Description must be at least 50 characters.",
    }),
    requirements: z.string().min(20, {
        message: "Requirements must be at least 20 characters.",
    }),
    responsibilities: z.string().min(20, {
        message: "Responsibilities must be at least 20 characters.",
    }),
});

export default function PostJobClient({ userId }) {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            company: "",
            location: "",
            type: "Full-time",
            salary: "",
            description: "",
            requirements: "",
            responsibilities: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!supabase) {
            toast({
                title: "Error",
                description: "Unable to post job. Please try again.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        // Insert job into database
        const { error } = await supabase
            .from('jobs')
            .insert({
                title: values.title,
                company: values.company,
                location: values.location,
                type: values.type,
                salary: values.salary,
                description: values.description,
                requirements: values.requirements,
                responsibilities: values.responsibilities,
                posted_by: userId,
                status: 'active'
            });

        setIsSubmitting(false);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to post job. Please try again.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Job Posted Successfully",
            description: "Your job has been posted and is now live.",
        });

        router.push("/admin/jobs");
    }

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Post a New Job</h1>
                <Button variant="outline" asChild>
                    <Link href="/admin/dashboard">Cancel</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                        Fill in the details for the job posting. Be as specific as possible to attract the right candidates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Frontend Developer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. TechCorp" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. San Francisco, CA or Remote" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select job type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                    <SelectItem value="Internship">Internship</SelectItem>
                                                    <SelectItem value="Remote">Remote</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="salary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Salary Range</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. $80,000 - $100,000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the job role, responsibilities, and company culture..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requirements</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="List the skills, qualifications, and experience required..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Enter each requirement on a new line.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="responsibilities"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Responsibilities</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="List the key responsibilities and duties..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Enter each responsibility on a new line.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/dashboard">Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Posting..." : "Post Job"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}