export interface Issue {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    category_id: number;
    priority_id: number;
    status_id: number;
    ai_summary?: string;
    ai_next_action?: string;
    category: { id: number; name: string };
    priority: { id: number; name: string; slug: string };
    status: { id: number; name: string; slug?: string };
    assigned_user?: { id: string; name: string };
    assigned_agent_id?: string;
    identification_number?: string;
}
