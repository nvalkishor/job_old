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
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, we would authenticate with an API
    // For demo purposes, we'll simulate a successful login

    // Simulate user data from backend
    const userData = {
      name: "Demo User",
      email: values.email,
      role: values.email.includes("admin") ? "admin" : "candidate",
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData))
    }

    toast({
      title: "Login Successful",
      description: "You have been logged in successfully.",
    })

    // Redirect based on role
    if (userData.role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/candidate/dashboard")
    }
  }

  function handleForgotPassword() {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    // Simulate sending OTP
    toast({
      title: "OTP Sent",
      description: "A verification code has been sent to your email.",
    })
  }

  function verifyOtp() {
    if (otp === "123456") {
      // In a real app, we would verify with the server
      toast({
        title: "Verification Successful",
        description: "You can now reset your password.",
      })

      // In a real app, we would redirect to a password reset page
      router.push("/auth/reset-password")
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
      {!isForgotPassword ? (
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={(e) => {
                            e.preventDefault()
                            setEmail(form.getValues().email)
                            setIsForgotPassword(true)
                          }}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      ) : !isVerifying ? (
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a verification code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button onClick={handleForgotPassword} className="w-full">
                Send Verification Code
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>
                Back to Login
              </Button>
            </div>
          </CardContent>
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
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

