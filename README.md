# CivicPrep

CivicPrep is an adaptive study app for the USCIS civics test. It helps people practice all 100 official questions, simulate the real 10-question interview format, and focus on the topics they are most likely to miss.

## Why this project matters

Preparing for the US citizenship interview can be stressful because the content is simple on paper but difficult to retain under pressure. CivicPrep turns the official question bank into a guided learning loop: practice, test, review weak areas, and build confidence over time.

This project is part of my public portfolio because it shows product thinking applied to a real user need: clear learning goals, low-friction practice, adaptive review, and progress visibility.

## Product highlights

- Complete question bank with all 100 official USCIS civics questions.
- Realistic test simulation: 10 randomized questions, 6 correct answers required to pass.
- 100-question challenge mode split into 10 parts for full coverage.
- Adaptive practice that prioritizes questions the user struggles with most.
- Localized answers for Weehawken, NJ representatives and officials.
- Progress tracking for accuracy, pass rate, and challenge completion.
- Dark mode and responsive UI for frequent short practice sessions.

## My role

I defined the product concept, learning flow, feature set, and implementation approach. The goal was to create a simple but complete product experience rather than a static flashcard list.

Key product decisions:

- Match the real interview format so practice feels familiar.
- Use adaptive review to reduce wasted repetition.
- Separate quick practice from full challenge mode.
- Make progress visible without overwhelming the user.
- Keep the interface calm and focused for high-frequency practice.

## Tech stack

- React
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix UI primitives
- Node.js and Express
- TanStack Query
- React Hook Form
- Zod
- Wouter

## Core user flows

### Practice mode

Users answer individual questions, receive immediate feedback, and revisit weaker areas more often.

### Test simulation

Users take a 10-question test that mirrors the USCIS interview scoring model. A passing score requires 6 correct answers.

### 100-question challenge

Users complete all 100 official questions across 10 randomized parts, with no repetition across each full challenge cycle.

### Progress review

Users can see test history, accuracy, pass rate, and completion progress to understand whether they are ready for the real interview.

## Project structure

```text
client/                 Frontend React application
  src/
    components/         Reusable UI components
    pages/              Page-level views
    hooks/              Custom React hooks
    lib/                Utilities and API client
server/                 Express backend
  services/             Business logic services
  routes.ts             API routes
  storage.ts            Storage interface
shared/                 Shared types and schemas
```

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5000
```

## Data source

Questions and answers are based on official USCIS civics test materials. The USCIS civics question content is public domain.

## Portfolio note

CivicPrep is a small product, but it reflects the same product habits I use in larger platform work: understand the user context, reduce friction, design a clear feedback loop, and make progress measurable.

## License

This project is for educational purposes.