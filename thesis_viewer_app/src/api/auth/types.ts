export type User = {
    id: string;
    email: string;
    role: 'User';
    name: string;
    terms_and_condition: boolean;
    created_at: string;
} 

export type UserCreateInput = {
    id: string;
    email: string;
    role: 'User';
}