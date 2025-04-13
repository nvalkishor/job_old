﻿// app/auth/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] py-10">
            <SignIn
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                    }
                }}
                redirectUrl="/auth/callback?redirect_url=/"
            />
        </div>
    );
}