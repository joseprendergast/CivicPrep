# USCIS Civics Test Simulator

An intelligent, adaptive learning platform for US citizenship exam preparation featuring all 100 official USCIS civics questions.

## Features

- **Complete Question Bank**: All 100 official USCIS civics questions with multiple-choice answers
- **Test Simulation**: 10-question tests requiring 6 correct answers to pass (matches actual test format)
- **100 Questions Challenge**: Practice all 100 questions across 10 randomized test parts
- **Adaptive Learning**: Algorithm prioritizes questions users struggle with most
- **Localized Information**: Weehawken, NJ specific answers for local representatives and officials
- **Dark Mode Support**: Automatic theme switching based on device preferences
- **Progress Tracking**: Detailed statistics on test performance and learning progress

## Question Categories

- **American Government** (57 questions)
  - System of Government
  - Rule of Law
  - Rights and Responsibilities
- **American History** (31 questions)
  - Colonial Period and Independence
  - 1800s
  - 1900s to Present
- **Integrated Civics** (12 questions)
  - Geography
  - Symbols
  - Holidays

## Technical Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js with Express
- **Storage**: In-memory storage with TypeScript interfaces
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── server/                 # Backend Express server
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Data storage interface
├── shared/                 # Shared types and schemas
└── README.md
```

## Test Modes

### Practice Mode
- Single question practice
- Adaptive algorithm selects challenging questions
- Immediate feedback with explanations

### Test Simulation
- 10 randomized questions
- Pass with 6+ correct answers
- Tracks performance history
- Avoids recently seen questions

### 100 Questions Challenge
- Complete all 100 questions across 10 tests
- Each test labeled as "Part X of 10"
- No question repetition across parts
- Comprehensive coverage of all topics

## Key Features Implementation

### Randomization
- Questions randomized for each test
- Answer options shuffled to prevent pattern memorization
- Smart question selection avoids recent duplicates

### Adaptive Learning
- Tracks user performance per question
- Prioritizes questions with lower success rates
- Balances new content with review material

### Progress Tracking
- Tests taken and pass rates
- Questions answered and accuracy
- Detailed performance analytics
- Challenge mode completion tracking

## Development

The application uses modern web development practices:

- **TypeScript** for type safety
- **React Query** for server state management
- **Zod** for runtime type validation
- **Tailwind CSS** for styling
- **shadcn/ui** for consistent component design

## Data Source

Questions and answers are based on the official USCIS civics test materials, ensuring accuracy and compliance with current citizenship exam requirements.

## License

This project is for educational purposes. USCIS question content is public domain.