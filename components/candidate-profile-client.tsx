// components/candidate-profile-client.tsx
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { FileUp, Upload } from 'lucide-react'
import { useSupabaseClient } from "@/lib/supabase-auth"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    age: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
        message: "Age must be a positive number.",
    }),
    occupation: z.string().min(2, {
        message: "Occupation is required.",
    }),
    experience: z.string().min(1, {
        message: "Experience is required.",
    }),
    location: z.string().min(2, {
        message: "Location is required.",
    }),
    bio: z.string().min(20, {
        message: "Bio must be at least 20 characters.",
    }),
})

// Define the type for the form values
type FormValues = z.infer<typeof formSchema>

// Define the interface for the existing profile
interface CandidateProfile {
    id: string
    user_id: string
    name?: string
    age?: number
    occupation?: string
    experience?: string
    location?: string
    bio?: string
    resume_file_name?: string
    resume_file_url?: string
    created_at: string
    updated_at: string
}

// Define the props interface
interface CandidateProfileClientProps {
    userId: string
    existingProfile: CandidateProfile | null
}

export default function CandidateProfileClient({ userId, existingProfile }: CandidateProfileClientProps) {
    const router = useRouter()
    const supabase = useSupabaseClient()
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            age: "",
            occupation: "",
            experience: "",
            location: "",
            bio: "",
        },
    })

    // Set form values if profile exists
    useEffect(() => {
        if (existingProfile) {
            form.reset({
                name: existingProfile.name || "",
                age: existingProfile.age ? existingProfile.age.toString() : "",
                occupation: existingProfile.occupation || "",
                experience: existingProfile.experience || "",
                location: existingProfile.location || "",
                bio: existingProfile.bio || "",
            })
        }
    }, [existingProfile, form])

    async function onSubmit(values: FormValues) {
        if (!supabase) {
            toast({
                title: "Error",
                description: "Unable to save profile. Please try again.",
                variant: "destructive",
            })
            return
        }

        // Validate resume file
        if (!existingProfile && !resumeFile) {
            toast({
                title: "Resume Required",
                description: "Please upload your resume.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        let resumeFileName = existingProfile?.resume_file_name
        let resumeFileUrl = existingProfile?.resume_file_url

        // Upload resume if provided
        if (resumeFile) {
            const fileExt = resumeFile.name.split(".").pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("resumes")
                .upload(fileName, resumeFile)

            if (uploadError) {
                setIsSubmitting(false)
                toast({
                    title: "Upload Failed",
                    description: "Failed to upload resume. Please try again.",
                    variant: "destructive",
                })
                return
            }

            // Get public URL
            const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName)

            resumeFileName = resumeFile.name
            resumeFileUrl = urlData.publicUrl
        }

        // Prepare profile data
        const profileData = {
            user_id: userId,
            name: values.name,
            age: Number.parseInt(values.age),
            occupation: values.occupation,
            experience: values.experience,
            location: values.location,
            bio: values.bio,
            resume_file_name: resumeFileName,
            resume_file_url: resumeFileUrl,
        }

        // Update or create profile
        let error
        if (existingProfile) {
            ; ({ error } = await supabase.from("candidate_profiles").update(profileData).eq("id", existingProfile.id))
        } else {
            ; ({ error } = await supabase.from("candidate_profiles").insert(profileData))
        }

        setIsSubmitting(false)

        if (error) {
            toast({
                title: "Error",
                description: "Failed to save profile. Please try again.",
                variant: "destructive",
            })
            return
        }

        toast({
            title: existingProfile ? "Profile Updated" : "Profile Created",
            description: existingProfile
                ? "Your profile has been updated successfully."
                : "Your profile has been created successfully.",
        })

        router.push("/candidate/dashboard")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Validate file type
            const validTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]
            if (!validTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a PDF, DOC, or DOCX file.",
                    variant: "destructive",
                })
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File Too Large",
                    description: "Please upload a file smaller than 5MB.",
                    variant: "destructive",
                })
                return
            }

            setResumeFile(file)
        }
    }

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">{existingProfile ? "Edit Profile" : "Complete Your Profile"}</h1>
                <Button variant="outline" asChild>
                    <Link href="/candidate/dashboard">Cancel</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Provide your details to help employers learn more about you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <Input placeholder="25" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="occupation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Occupation</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Software Developer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Years of Experience</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select experience" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0-1">0-1 years</SelectItem>
                                                    <SelectItem value="1-3">1-3 years</SelectItem>
                                                    <SelectItem value="3-5">3-5 years</SelectItem>
                                                    <SelectItem value="5-10">5-10 years</SelectItem>
                                                    <SelectItem value="10+">10+ years</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                <Input placeholder="San Francisco, CA" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Professional Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell employers about yourself, your skills, and your career goals..."
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Resume</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-600 text-white p-4 rounded-lg flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-700 transition-colors">
                                        <input
                                            type="file"
                                            id="resume"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="resume" className="cursor-pointer text-center">
                                            <Upload className="h-8 w-8 mb-2 mx-auto" />
                                            <span className="text-sm font-medium">
                                                {resumeFile
                                                    ? resumeFile.name
                                                    : existingProfile?.resume_file_name || "Upload Resume (PDF, DOC, DOCX)"}
                                            </span>
                                            <p className="text-xs mt-1">Max size: 5MB</p>
                                        </label>
                                    </div>
                                </div>
                                {existingProfile?.resume_file_name && !resumeFile && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <FileUp className="h-4 w-4" />
                                        Current file: {existingProfile.resume_file_name}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/candidate/dashboard">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
