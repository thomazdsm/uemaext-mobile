export interface Report {
    id?: number;
    name: string;
    project: {
        id: number;
        title: string;
    };
    description: string;
    status: {
        id: number;
        name: string;
    };
    created_at?: string;
    updated_at?: string;
}