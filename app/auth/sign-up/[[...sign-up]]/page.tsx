// app/auth/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] py-10">
            <SignUp
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