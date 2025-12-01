# USCIS Civics Test Simulator

## Overview

This is a web-based US citizenship exam preparation platform featuring an intelligent, adaptive learning system. The application helps users practice all 100 official USCIS civics questions through various test modes including practice sessions, simulations, and comprehensive 100-question challenges. The system uses adaptive learning algorithms to prioritize questions users struggle with most.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: shadcn/ui built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Theme System**: Dynamic theme switching with support for light, dark, and system preferences

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Data Storage**: Structured schemas for questions, user progress, test sessions, and question history
- **Build System**: Vite for development and production builds with ESBuild for server bundling

### Authentication & User Management
- **Session Management**: Token-based user identification stored in localStorage
- **User Tracking**: Anonymous user tokens for progress tracking without registration
- **Progress Persistence**: User statistics and question history stored per user token

## Key Components

### Question Management
- **Question Bank**: Complete set of 100 official USCIS civics questions
- **Categories**: American Government (57), American History (31), Integrated Civics (12)
- **Location-Specific Data**: Customized for Weehawken, NJ with local representatives and officials
- **Multiple Choice Format**: Each question includes multiple choice options with explanations

### Adaptive Learning System
- **Algorithm**: Prioritizes questions based on user performance history
- **Question Selection**: 
  1. Previously missed questions (higher priority for multiple misses)
  2. Location-specific questions
  3. Unseen questions
  4. Random selection as fallback
- **Performance Tracking**: Tracks attempt counts, correctness, and last attempt dates per question

### Test Modes
- **Practice Mode**: Single question practice with immediate feedback
- **Simulation Mode**: 10-question tests matching actual USCIS format (6/10 to pass)
- **100 Questions Challenge**: Complete question bank across 10 randomized test parts
- **Progress Tracking**: Detailed statistics on performance and learning progress

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Automatic theme detection with manual override options
- **Progress Indicators**: Visual feedback on test progress and performance
- **Accessibility**: Built on Radix UI primitives for screen reader compatibility

## Data Flow

### Question Delivery
1. Client requests test creation with user token and test type
2. Server applies adaptive algorithm to select appropriate questions
3. Questions delivered with options and metadata
4. Client presents questions with interactive interface

### Answer Processing
1. User selects answer option
2. Client submits answer to server with question and user context
3. Server validates answer, updates user history, and calculates adaptive scoring
4. Server returns feedback with correct answer and explanation
5. Client displays immediate feedback and updates progress

### Progress Tracking
1. Server maintains user progress across multiple tables
2. Question history tracks individual question performance
3. Test sessions store complete test results
4. User progress aggregates overall statistics
5. Adaptive algorithm uses this data for future question selection

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm & drizzle-kit**: Type-safe database operations and migrations
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **wouter**: Lightweight React routing
- **react-hook-form & @hookform/resolvers**: Form handling with validation
- **zod**: Runtime type validation and schema validation

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority & clsx**: Dynamic className utilities
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Database Setup
- **Migrations**: Drizzle Kit handles schema migrations with `drizzle-kit push`
- **Environment**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **Schema**: Shared TypeScript schema definitions in `shared/schema.ts`

### Build Process
1. **Frontend Build**: Vite compiles React application to static assets in `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Development**: `tsx` runs TypeScript server directly with hot reloading
4. **Production**: Node.js serves bundled application

### Environment Configuration
- **Development**: Uses Vite dev server with API proxy
- **Production**: Express serves static files and API endpoints
- **Database**: Serverless PostgreSQL through Neon Database
- **Session Storage**: Token-based sessions with localStorage persistence

### Performance Optimizations
- **Query Caching**: TanStack Query provides intelligent caching and background updates
- **Adaptive Loading**: Questions loaded on-demand based on user performance
- **Static Assets**: Vite optimizes and bundles CSS, JavaScript, and other assets
- **Database Indexing**: Optimized queries for user progress and question retrieval