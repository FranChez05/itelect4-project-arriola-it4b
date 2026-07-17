import type { User } from "../types/index.js";
import { student } from "./sample.js";

// ===== GENERIC FUNCTIONS =====
function getFirst<T>(items: T[]): T | undefined {
	return items[0];
}

function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
	return items.find((item) => item.id === id);
}

const firstUser = getFirst<User>([student]);
const foundUser = getById<User>([student], 1);

console.log(firstUser?.name);
console.log(foundUser?.email);