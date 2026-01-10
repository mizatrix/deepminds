export type User = {
    id: number;
    full_name: string;
    email: string;
    faculty: string;
    department: string | null;
    grad_year: number;
};

export type Achievement = {
    id: number;
    user_id: number;
    category: "scientific" | "artistic" | "training" | "competition" | "award" | "sports" | "internship";
    title: string;
    description: string;
    org_name: string;
    start_date: string;
    end_date: string;
    location: string;
    evidence_url: string | null;
    status: "approved" | "pending" | "rejected";
    points: number;
};

export const users: User[] = [
    { id: 1, full_name: "Omar Khaled", email: "omar@example.com", faculty: "Engineering", department: "Computer", grad_year: 2024 },
    { id: 2, full_name: "Radwa Ahmed", email: "radwa@example.com", faculty: "Media", department: "Advertising", grad_year: 2023 },
    { id: 3, full_name: "Farida Hassan", email: "farida@example.com", faculty: "Business", department: "Marketing", grad_year: 2025 },
    { id: 4, full_name: "Youssef Ali", email: "youssef@example.com", faculty: "Engineering", department: "Mechanical", grad_year: 2024 },
    { id: 5, full_name: "Admin User", email: "admin@example.com", faculty: "IT", department: null, grad_year: 2020 }
];

export const achievements: Achievement[] = [
    { id: 1, user_id: 1, category: "scientific", title: "AI Research Paper", description: "Paper on recommendation systems.", org_name: "XYZ Conference", start_date: "2025-03-10", end_date: "2025-03-15", location: "Cairo", evidence_url: "https://doi.org/10.xxx/xyz", status: "approved", points: 10 },
    { id: 2, user_id: 2, category: "scientific", title: "Capstone: Smart Campus App", description: "Excellent grade project.", org_name: "University", start_date: "2024-06-01", end_date: "2024-06-30", location: "Giza", evidence_url: null, status: "approved", points: 10 },
    { id: 3, user_id: 2, category: "artistic", title: "Photography Exhibition", description: "Displayed 15 curated photos.", org_name: "Arts Hall", start_date: "2024-12-01", end_date: "2024-12-10", location: "Cairo", evidence_url: null, status: "approved", points: 10 },
    { id: 4, user_id: 3, category: "training", title: "Digital Marketing Course", description: "40-hour certified program.", org_name: "Google Digital Garage", start_date: "2025-02-01", end_date: "2025-02-28", location: "Online", evidence_url: "https://...", status: "approved", points: 6 },
    { id: 5, user_id: 1, category: "internship", title: "Backend Internship", description: "Node.js backend developer.", org_name: "TechSoft", start_date: "2024-07-01", end_date: "2024-09-30", location: "Cairo", evidence_url: "https://...", status: "approved", points: 8 },
    { id: 6, user_id: 1, category: "competition", title: "University Hackathon", description: "Team of 4 students, finalist.", org_name: "HackU", start_date: "2024-11-20", end_date: "2024-11-22", location: "Cairo", evidence_url: "https://...", status: "approved", points: 8 },
    { id: 7, user_id: 2, category: "competition", title: "Media Olympiad", description: "2nd place nationally.", org_name: "Universities Union", start_date: "2025-04-05", end_date: "2025-04-07", location: "Alexandria", evidence_url: "https://...", status: "approved", points: 10 },
    { id: 8, user_id: 3, category: "award", title: "Best Marketing Project", description: "Faculty recognition award.", org_name: "Business Faculty", start_date: "2025-05-15", end_date: "2025-05-15", location: "Cairo", evidence_url: null, status: "approved", points: 12 },
    { id: 9, user_id: 1, category: "sports", title: "Football Championship", description: "1st place, university league.", org_name: "Sports Union", start_date: "2025-03-01", end_date: "2025-03-30", location: "Cairo", evidence_url: null, status: "approved", points: 12 },
    { id: 10, user_id: 4, category: "sports", title: "Swimming Nationals", description: "Bronze medal 100m freestyle.", org_name: "Egypt Swimming Fed.", start_date: "2024-08-12", end_date: "2024-08-15", location: "Cairo", evidence_url: null, status: "approved", points: 10 },
    { id: 11, user_id: 4, category: "training", title: "CNC Workshop", description: "Hands-on workshop.", org_name: "ME Dept.", start_date: "2024-05-01", end_date: "2024-05-03", location: "On Campus", evidence_url: null, status: "approved", points: 6 }
];
