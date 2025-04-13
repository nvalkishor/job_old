//app / login / page.tsx
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
    publicRoutes: [
        "/",
        "/jobs",
        "/jobs/(.*)",
        "/auth/login",
        "/auth/register",
        "/api/webhook/clerk",
    ],
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};