# IT Elective 4 Project

This project demonstrates TypeScript generic types and utility types for a simple student/course app.

## Concept

- `User`, `Course`, and `Submission` are core interfaces in `types/index.ts`.
- `Role` is defined as an enum for user roles.
- `ApiResponse<T>` is a generic interface for API payloads.
- Generic functions like `getFirst` and `getById` demonstrate type-safe collection access.
- Utility types used: `Partial`, `Pick`, `Omit`, `Record`.

## Run

Install dependencies:

```bash
npm install
```

Type-check without emitting JS:

```bash
npm run check
```

Run the sample entry point:

```bash
npx ts-node src/sample.ts
```
