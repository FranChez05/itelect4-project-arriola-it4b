export enum Role {
    Student = "student",
    Instructor = "instructor",
    Admin = "admin",
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    score: number;
}

export interface Course {
    id: number;
    name: string;
    units: number;
    semester: string;
}

export interface Submission {
    id: number;
    studentId: number;
    courseId: number;
    submittedAt: string;
    score: number;
    grade: string;
}

export interface Grade {
    score: number;
    maxScore: number;
    letterGrade: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type UserUpdate = Partial<User>;
export type CourseSummary = Pick<Course, "id" | "name">;
export type SubmissionRecord = Record<number, Submission>;
export type ApiResult<T> = Omit<ApiResponse<T>, "message">;
