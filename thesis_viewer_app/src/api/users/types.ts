export type AnalyticsUserType ={
    id: string;
    role?: string;
}

export type UserManagementUserType = {
    id: string;
    name: string;
    email: string;
    role: string | null;
    avatar_url?: string;      
}