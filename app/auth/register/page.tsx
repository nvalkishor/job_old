//app/register/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
    return (
        <div className="container max-w-md py-12">
            <SignUp
                appearance={{
                    elements: {
                        formButtonPrimary: "bg-primary hover:bg-primary/90",
                        footerActionLink: "text-primary hover:text-primary/90",
                    }
                }}
            />
        </div>
    );
}