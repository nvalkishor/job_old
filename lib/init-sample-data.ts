import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export async function initializeSampleJobs() {
    const supabase = createClientComponentClient<Database>();

    // Check if jobs already exist
    const { data: existingJobs, error: checkError } = await supabase
        .from('jobs')
        .select('id')
        .limit(1);

    if (checkError) {
        console.error('Error checking for existing jobs:', checkError);
        return;
    }

    // If jobs already exist, don't add sample data
    if (existingJobs && existingJobs.length > 0) {
        console.log('Jobs already exist, skipping initialization');
        return;
    }

    console.log('No jobs found, initializing sample data...');

    // Sample job data
    const sampleJobs = [
        {
            title: "Frontend Developer",
            company: "TechCorp",
            location: "San Francisco, CA",
            type: "Full-time",
            salary: "$90,000 - $120,000",
            description: "We are looking for a skilled Frontend Developer to join our team. The ideal candidate should have experience with React, TypeScript, and modern CSS frameworks.",
            requirements: "3+ years of experience with React\nStrong knowledge of TypeScript\nExperience with CSS frameworks like Tailwind\nUnderstanding of responsive design principles\nFamiliarity with version control systems (Git)",
            responsibilities: "Develop and maintain user interfaces for web applications\nCollaborate with designers to implement UI/UX designs\nWrite clean, maintainable, and efficient code\nOptimize applications for maximum speed and scalability\nParticipate in code reviews and team discussions",
            status: "active"
        },
        {
            title: "UX Designer",
            company: "DesignHub",
            location: "New York, NY",
            type: "Contract",
            salary: "$70 - $90 per hour",
            description: "DesignHub is seeking a talented UX Designer to create exceptional user experiences for our clients. You will work closely with our product and development teams to design intuitive and engaging interfaces.",
            requirements: "4+ years of experience in UX/UI design\nProficiency with design tools like Figma and Adobe XD\nPortfolio demonstrating strong UX design skills\nExperience conducting user research and usability testing\nStrong communication and collaboration skills",
            responsibilities: "Create wireframes, prototypes, and user flows\nConduct user research and analyze user feedback\nCollaborate with developers to ensure design implementation\nCreate and maintain design systems\nStay updated on UX trends and best practices",
            status: "active"
        },
        {
            title: "Backend Engineer",
            company: "DataSystems",
            location: "Remote",
            type: "Full-time",
            salary: "$100,000 - $130,000",
            description: "DataSystems is looking for a Backend Engineer to help build and maintain our server infrastructure. You'll be working with modern technologies to create scalable and efficient systems.",
            requirements: "Experience with Node.js, Python, or Java\nKnowledge of database systems (SQL and NoSQL)\nUnderstanding of RESTful APIs and microservices\nFamiliarity with cloud platforms (AWS, Azure, or GCP)\nExperience with containerization (Docker, Kubernetes)",
            responsibilities: "Design and implement backend services and APIs\nOptimize database performance and queries\nEnsure high availability and scalability of systems\nImplement security best practices\nCollaborate with frontend developers to integrate user-facing elements",
            status: "active"
        }
    ];

    // Insert sample jobs
    const { error: insertError } = await supabase
        .from('jobs')
        .insert(sampleJobs.map(job => ({
            ...job,
            posted_by: null, // This will be updated when you have admin users
            created_at: new Date().toISOString()
        })));

    if (insertError) {
        console.error('Error inserting sample jobs:', insertError);
    } else {
        console.log('Sample jobs initialized successfully');
    }
}