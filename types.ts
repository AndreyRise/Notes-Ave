export interface SubTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    createdAt: number;
    reminderTime?: string; // ISO string
    subTasks: SubTask[];
    priority: PriorityLevel;
}

export type FilterType = 'all' | 'active' | 'completed';

export enum PriorityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}