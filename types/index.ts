export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    score: number;
}

export interface Course {
    id: number;
    name: string;
    units: number;
    semester: string;
}

export interface Grade {
    score: number;
    maxScore: number;
    letterGrade: string;
}