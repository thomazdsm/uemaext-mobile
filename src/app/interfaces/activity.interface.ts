export interface Activity {
    id?: number;
    name: string;
    project: {
        id: number;
        title: string;
    };
    description: string;
    due_date: string;
    status: {
        id: number;
        name: string;
    };
    created_at?: string;
    updated_at?: string;
}
