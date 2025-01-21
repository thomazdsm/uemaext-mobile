export interface Assignment {
    id?: number;
    project: {
        id: number;
        title: string;
    };
    user: {
        id: number;
        name: string;
    };
    role: string;
    created_at?: string;
    updated_at?: string;
}