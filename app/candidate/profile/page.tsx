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
import { FileUp, Upload } from "lucide-react"

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

export default function CandidateProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [existingProfile, setExistingProfile] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in and is a candidate
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (userData.role === "candidate") {
          setUser(userData)

          // Check if profile exists (in a real app, this would be from an API)
          const storedProfile = localStorage.getItem("candidateProfile")
          if (storedProfile) {
            const profileData = JSON.parse(storedProfile)
            setExistingProfile(profileData)
          }
        } else {
          // Redirect non-candidate users
          router.push("/")
        }
      } else {
        // Redirect unauthenticated users
        router.push("/auth/login")
      }
    }
  }, [router]) // Add router to dependency array

  const form = useForm<z.infer<typeof formSchema>>({
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
        name: existingProfile.name,
        age: existingProfile.age.toString(),
        occupation: existingProfile.occupation,
        experience: existingProfile.experience,
        location: existingProfile.location,
        bio: existingProfile.bio,
      })
    }
  }, [existingProfile, form]) // Add form to dependency array

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate resume file
    if (!existingProfile && !resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume.",
        variant: "destructive",
      })
      return
    }

    // In a real app, we would send this to an API
    const profileData = {
      ...values,
      age: Number.parseInt(values.age),
      resumeFileName: resumeFile ? resumeFile.name : existingProfile?.resumeFileName,
    }

    // Store in localStorage for demo purposes
    if (typeof window !== "undefined") {
      localStorage.setItem("candidateProfile", JSON.stringify(profileData))
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

  if (!user) {
    return null // Loading state
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
                          : existingProfile?.resumeFileName || "Upload Resume (PDF, DOC, DOCX)"}
                      </span>
                      <p className="text-xs mt-1">Max size: 5MB</p>
                    </label>
                  </div>
                </div>
                {existingProfile?.resumeFileName && !resumeFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileUp className="h-4 w-4" />
                    Current file: {existingProfile.resumeFileName}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/candidate/dashboard">Cancel</Link>
                </Button>
                <Button type="submit">{existingProfile ? "Update Profile" : "Create Profile"}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

