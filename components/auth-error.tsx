// components/auth-error.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
    message: string;
    redirectTo?: string;
    redirectLabel?: string;
}

export default function AuthError({
    message = "Authentication error",
    redirectTo = "/",
    redirectLabel = "Go Home"
}: AuthErrorProps) {
    const router = useRouter();

    useEffect(() => {
        // You could add analytics or logging here
    }, []);

    return (
        <div className="container max-w-md py-12">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle>Authentication Error</CardTitle>
                    </div>
                    <CardDescription>There was a problem with your authentication</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{message}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.push(redirectTo)} className="w-full">
                        {redirectLabel}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}