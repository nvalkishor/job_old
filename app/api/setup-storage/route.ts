import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/types/supabase"

export async function POST() {
    try {
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

        // Create resumes bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets()

        if (!buckets?.find((bucket) => bucket.name === "resumes")) {
            await supabase.storage.createBucket("resumes", {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error setting up storage:", error)
        return NextResponse.json({ error: "Failed to set up storage" }, { status: 500 })
    }
}

