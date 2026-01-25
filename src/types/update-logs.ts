export interface UpdateLogChange {
    type: "feature" | "improvement" | "fix" | "bug fix";
    text: string;
}

export interface UpdateLog {
    id: string;
    version: string;
    title: string;
    description: string;
    date: string;
    changes: UpdateLogChange[];
    created_at: string;
    created_by?: string;
}
