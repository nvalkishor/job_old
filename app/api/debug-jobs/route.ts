// app/api/debug-jobs/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET() {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Check if jobs table exists
        const { data: tableInfo, error: tableError } = await supabase
            .from('jobs')
            .select('count')
            .single();

        if (tableError) {
            return NextResponse.json({ error: tableError.message, hint: "Jobs table might not exist or you don't have access" }, { status: 500 });
        }

        // Get job count
        const { count } = tableInfo || { count: 0 };

        // Get sample jobs
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .limit(3);

        if (jobsError) {
            return NextResponse.json({ error: jobsError.message, hint: "Error fetching jobs" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count,
            jobs,
            message: count > 0 ? "Jobs found" : "No jobs found, you may need to initialize sample data"
        });
    } catch (error) {
        console.error('Error in debug API:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Unknown error",
            hint: "Check your Supabase connection and configuration"
        }, { status: 500 });
    }
}