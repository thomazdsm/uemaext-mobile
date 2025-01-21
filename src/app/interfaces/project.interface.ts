export interface Project {
    id?: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    department: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
    created_at?: string;
    updated_at?: string;
  }