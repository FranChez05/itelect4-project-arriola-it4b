import type { User } from "../types/index.js";
import { Role } from "../types/index.js";

function getUser(id: number): User {
    return {
        id,
        name: "Juan dela Cruz",
        email: "juan@example.com",
        role: Role.Student,
        isActive: true,
        score: 95.5,
    };
}

function calculateGrade(score: number, maxScore: number): string {
    const percentage: number = (score / maxScore) * 100;
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    return "F";
}


function formatCourse(
    name: string,
    units: number,
    semester: string
): string {
    return `${name} (${units} units) - ${semester}`;
}

export const student: User = getUser(1);

console.log(student);
console.log(calculateGrade(85, 100));
console.log(formatCourse("IT Elective 4", 3, "1st Semester"));