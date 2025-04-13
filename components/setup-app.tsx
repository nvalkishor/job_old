"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { initializeSampleJobs } from "@/lib/init-sample-data"

export function SetupApp() {
    const { isLoaded } = useUser()
    const [isSetupComplete, setIsSetupComplete] = useState(false)

    useEffect(() => {
        async function setupApp() {
            if (isSetupComplete) return

            try {
                console.log("Running app setup...")
                // Initialize sample jobs
                await initializeSampleJobs()

                setIsSetupComplete(true)
                console.log("App setup completed successfully")
            } catch (error) {
                console.error("Error during app setup:", error)
            }
        }

        if (isLoaded) {
            setupApp()
        }
    }, [isLoaded, isSetupComplete])

    // This component doesn't render anything
    return null
}

