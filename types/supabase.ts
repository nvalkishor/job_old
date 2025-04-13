export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            jobs: {
                Row: {
                    company: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    location: string | null
                    posted_by: string | null
                    requirements: string | null
                    responsibilities: string | null
                    salary: string | null
                    status: string | null
                    title: string | null
                    type: string | null
                    updated_at: string | null
                }
                Insert: {
                    company?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    location?: string | null
                    posted_by?: string | null
                    requirements?: string | null
                    responsibilities?: string | null
                    salary?: string | null
                    status?: string | null
                    title?: string | null
                    type?: string | null
                    updated_at?: string | null
                }
                Update: {
                    company?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    location?: string | null
                    posted_by?: string | null
                    requirements?: string | null
                    responsibilities?: string | null
                    salary?: string | null
                    status?: string | null
                    title?: string | null
                    type?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "jobs_posted_by_fkey"
                        columns: ["posted_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            },
            users: {
                Row: {
                    clerk_id: string
                    created_at: string | null
                    email: string
                    id: string
                    name: string
                    role: string
                    updated_at: string | null
                }
                Insert: {
                    clerk_id: string
                    created_at?: string | null
                    email: string
                    id?: string
                    name: string
                    role: string
                    updated_at?: string | null
                }
                Update: {
                    clerk_id?: string
                    created_at?: string | null
                    email?: string
                    id?: string
                    name?: string
                    role?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            // Add other tables as needed
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            job_status: "draft" | "active" | "closed"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}