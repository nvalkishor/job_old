"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Info } from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/supabase";

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    adminKey: z.string().min(1, {
        message: "Admin key is required",
    }),
});

// For demo purposes, hardcoded admin key
const ADMIN_KEY = "admin123";

export default function InviteAdminPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [inviteLink, setInviteLink] = useState<string | null>(null);

    // Check if current user is an admin
    useEffect(() => {
        async function checkUserRole() {
            if (!isSignedIn || !user) {
                router.push("/auth/login");
                return;
            }

            const { data } = await db
                .from('users')
                .select('id, role')
                .eq('clerk_id', user.id)
                .single();

            if (!data || data.role !== 'admin') {
                router.push("/");
                toast({
                    title: "Access Denied",
                    description: "Only administrators can access this page.",
                    variant: "destructive",
                });
                return;
            }

            setUserRole(data.role);
            setUserId(data.id);
        }

        if (isLoaded) {
            checkUserRole();
        }
    }, [isLoaded, isSignedIn, user, router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            adminKey: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!userId) return;

        // Validate the admin key
        if (values.adminKey !== ADMIN_KEY) {
            toast({
                title: "Invalid Admin Key",
                description: "The admin key you provided is incorrect.",
                variant: "destructive",
            });
            return;
        }

        // Check if email already exists as a user
        const { data: existingUsers } = await db
            .from('users')
            .select('id')
            .eq('email', values.email);

        if (existingUsers && existingUsers.length > 0) {
            toast({
                title: "Email Already Registered",
                description: "This email is already registered in the system.",
                variant: "destructive",
            });
            return;
        }

        // Generate a secure invitation token
        const inviteToken = crypto.randomUUID();

        // Create expiration date (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Store the invite
        const { error } = await db
            .from('admin_invitations')
            .insert({
                email: values.email,
                token: inviteToken,
                created_by: userId,
                expires_at: expiresAt.toISOString(),
                status: 'pending',
            });

        if (error) {
            toast({
                title: "Error Creating Invitation",
                description: error.message,
                variant: "destructive",
            });
            return;
        }

        // Generate the invitation link
        const invitationLink = `${window.location.origin}/admin/auth/register?token=${inviteToken}`;
        setInviteLink(invitationLink);

        toast({
            title: "Admin Invited",
            description: "An invitation has been created successfully.",
        });
    }

    function copyToClipboard() {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            toast({
                title: "Copied to Clipboard",
                description: "Invitation link copied to clipboard.",
            });
        }
    }

    if (!isLoaded || !isSignedIn || !userRole) return null;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Invite Administrator</h1>
                    <p className="text-muted-foreground">Send an invitation to a new administrator</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Admin Invitation</CardTitle>
                    <CardDescription>
                        Invite a new administrator to help manage the job portal
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {inviteLink ? (
                        <div className="space-y-4">
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Invitation Created</AlertTitle>
                                <AlertDescription>
                                    In a real application, this link would be sent via email. For demo purposes,
                                    please copy and share this link with the new admin.
                                </AlertDescription>
                            </Alert>

                            <div className="p-3 bg-muted rounded-md relative">
                                <p className="text-sm break-all pr-8">{inviteLink}</p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-2 top-2"
                                    onClick={copyToClipboard}
                                >
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copy</span>
                                </Button>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setInviteLink(null)}>
                                    Create Another Invitation
                                </Button>
                                <Button onClick={() => router.push("/admin/users")}>
                                    Back to Users
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adminKey"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Admin Key</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter the admin key" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground">
                                                For demo purposes, use: admin123
                                            </p>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/admin/users")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create Invitation</Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}