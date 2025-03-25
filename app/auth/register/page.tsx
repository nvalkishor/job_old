"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    role: z.enum(["candidate", "admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [userData, setUserData] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "candidate",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, we would send this to an API
    setIsVerifying(true)
    setEmail(values.email)
    setUserData(values)

    // Simulate sending OTP
    toast({
      title: "OTP Sent",
      description: "A verification code has been sent to your email.",
    })
  }

  function verifyOtp() {
    if (otp === "123456") {
      // In a real app, we would verify with the server
      // Store user data (in a real app, this would be handled by the backend)
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: userData.name,
            email: userData.email,
            role: userData.role,
          }),
        )
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      })

      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/candidate/dashboard")
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "The verification code you entered is incorrect.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-md py-12">
      {!isVerifying ? (
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>We&apos;ve sent a verification code to {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Verification Code</FormLabel>
                <Input placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <p className="text-xs text-muted-foreground">For demo purposes, use code: 123456</p>
              </div>
              <Button onClick={verifyOtp} className="w-full">
                Verify
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsVerifying(false)}>
                Back to Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

