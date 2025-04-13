// components/admin-users-client.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Search, Trash2, Copy, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSupabaseClient } from "@/lib/supabase-auth"

// Define interfaces for props and data types
interface User {
    id: string
    name: string
    email: string
    role: string
    created_at: string
}

interface Creator {
    name?: string
    email?: string
}

interface Invitation {
    id: string
    email: string
    token: string
    status: string
    created_at: string
    expires_at: string
    creator?: Creator
}

interface AdminUsersClientProps {
    users: User[]
    invitations: Invitation[]
}

export default function AdminUsersClient({ users, invitations }: AdminUsersClientProps) {
    const supabase = useSupabaseClient()
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredUsers, setFilteredUsers] = useState(users)
    const [filteredInvitations, setFilteredInvitations] = useState(invitations)
    const [isDeleting, setIsDeleting] = useState(false)

    // Handle search
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users)
            setFilteredInvitations(invitations)
            return
        }

        const term = searchTerm.toLowerCase()

        // Filter users
        const matchedUsers = users.filter(
            (user) =>
                user.name?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.role?.toLowerCase().includes(term),
        )
        setFilteredUsers(matchedUsers)

        // Filter invitations
        const matchedInvitations = invitations.filter(
            (inv) =>
                inv.email?.toLowerCase().includes(term) ||
                inv.creator?.name?.toLowerCase().includes(term) ||
                inv.creator?.email?.toLowerCase().includes(term),
        )
        setFilteredInvitations(matchedInvitations)
    }

    // Clear search and reset filters
    const handleClearSearch = () => {
        setSearchTerm("")
        setFilteredUsers(users)
        setFilteredInvitations(invitations)
    }

    // Delete invitation
    const deleteInvitation = async (invitationId: string) => {
        if (!supabase) return

        setIsDeleting(true)

        const { error } = await supabase.from("admin_invitations").update({ status: "expired" }).eq("id", invitationId)

        setIsDeleting(false)

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete invitation. Please try again.",
                variant: "destructive",
            })
            return
        }

        // Update local state
        const updatedInvitations = filteredInvitations.filter((inv) => inv.id !== invitationId)
        setFilteredInvitations(updatedInvitations)

        toast({
            title: "Invitation Deleted",
            description: "The invitation has been deleted successfully.",
        })
    }

    // Copy invitation link
    const copyInvitationLink = (token: string) => {
        const inviteLink = `${window.location.origin}/admin/auth/register?token=${token}`
        navigator.clipboard.writeText(inviteLink)

        toast({
            title: "Copied to Clipboard",
            description: "Invitation link copied to clipboard.",
        })
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and invite new administrators</p>
                </div>
                <Button asChild>
                    <Link href="/admin/auth/invite">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Admin
                    </Link>
                </Button>
            </div>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Registered users in the system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
                        <p className="text-xs text-muted-foreground">Users with administrator privileges</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invitations.filter((inv) => inv.status === "pending").length}</div>
                        <p className="text-xs text-muted-foreground">Admin invitations awaiting registration</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users or invitations..."
                        className="pl-8 pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    {searchTerm && (
                        <button
                            className="absolute right-2.5 top-2.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                            onClick={handleClearSearch}
                            type="button"
                            aria-label="Clear search"
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">All Users</TabsTrigger>
                    <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>View and manage all users in the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h3 className="font-medium">{user.name}</h3>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                                <Button size="sm" variant="outline">
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "No users match your search." : "No users found in the system."}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invitations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>Admin invitations that have not been accepted yet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredInvitations.filter((inv) => inv.status === "pending").length > 0 ? (
                                <div className="space-y-4">
                                    {filteredInvitations
                                        .filter((inv) => inv.status === "pending")
                                        .map((invitation) => (
                                            <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h3 className="font-medium">{invitation.email}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Invited by {invitation.creator?.name || "Unknown"} on{" "}
                                                        {new Date(invitation.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Expires on {new Date(invitation.expires_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => copyInvitationLink(invitation.token)}>
                                                        <Copy className="h-4 w-4 mr-1" />
                                                        Copy Link
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="destructive">
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this invitation? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteInvitation(invitation.id)}
                                                                    disabled={isDeleting}
                                                                >
                                                                    {isDeleting ? "Deleting..." : "Delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "No invitations match your search." : "No pending invitations."}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

