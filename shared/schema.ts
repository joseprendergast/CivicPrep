import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Question schema
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionNumber: integer("question_number").notNull(),
  text: text("text").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  options: jsonb("options").notNull(),
  explanation: text("explanation").notNull(),
  isLocationSpecific: boolean("is_location_specific").default(false).notNull(),
  locationState: text("location_state"),
  locationCity: text("location_city"),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

// User Progress schema
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userToken: text("user_token").notNull().unique(),
  testsTaken: integer("tests_taken").default(0).notNull(),
  questionsAnswered: integer("questions_answered").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User Question History schema
export const userQuestionHistory = pgTable("user_question_history", {
  id: serial("id").primaryKey(),
  userToken: text("user_token").notNull(),
  questionId: integer("question_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptCount: integer("attempt_count").default(1).notNull(),
  lastAttemptDate: timestamp("last_attempt_date").defaultNow().notNull(),
});

export const insertUserQuestionHistorySchema = createInsertSchema(userQuestionHistory).omit({
  id: true,
});

// Test types definition
export const TEST_TYPES = {
  PRACTICE: "practice",
  SIMULATION: "simulation",
  CHALLENGE: "challenge" // 100 questions challenge mode
} as const;

export type TestType = typeof TEST_TYPES[keyof typeof TEST_TYPES];

// Test Session schema
export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  userToken: text("user_token").notNull(),
  testType: text("test_type").notNull(), // "practice", "simulation", or "challenge"
  questions: jsonb("questions").notNull(), // array of question IDs
  answers: jsonb("answers").notNull(), // array of user answers
  score: integer("score").notNull(),
  passed: boolean("passed"),
  challengeRound: integer("challenge_round"), // Tracks which round of the challenge (1-10)
  challengeGroupId: text("challenge_group_id"), // Groups together the 10 tests of a challenge
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

// Question option type
export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;

// Types
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserQuestionHistory = typeof userQuestionHistory.$inferSelect;
export type InsertUserQuestionHistory = z.infer<typeof insertUserQuestionHistorySchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;

// Test answer schema
export const submitAnswerSchema = z.object({
  questionId: z.number(),
  selectedOptionId: z.string(),
});

export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;

// Test result schema
export const testResultSchema = z.object({
  testId: z.number(),
  score: z.number(),
  totalQuestions: z.number(),
  passed: z.boolean(),
  questions: z.array(z.object({
    id: z.number(),
    text: z.string(),
    correctOption: questionOptionSchema,
    selectedOption: questionOptionSchema.nullable(),
    isCorrect: z.boolean(),
  })),
});

export type TestResult = z.infer<typeof testResultSchema>;

// User stats schema
export const userStatsSchema = z.object({
  testsTaken: z.number(),
  questionsAnswered: z.number(),
  correctAnswers: z.number(),
  correctPercentage: z.number(),
  missedQuestions: z.array(z.object({
    id: z.number(),
    text: z.string(),
    correctAnswer: z.string(),
    attemptCount: z.number(),
  })),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Challenge summary schema
export const challengeSummarySchema = z.object({
  challengeId: z.string(),
  completed: z.boolean(),
  currentRoundCompleted: z.boolean().optional(), // Flag to indicate if the current round is completed
  round: z.number(), // Current round (1-10)
  totalQuestionsAnswered: z.number(),
  totalQuestionsCorrect: z.number(),
  correctPercentage: z.number(),
  missedQuestions: z.array(z.object({
    id: z.number(),
    text: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    testRound: z.number(), // In which test round this question was asked
  })),
  remainingQuestions: z.array(z.number()).optional(), // IDs of questions not yet seen in the challenge
});

export type ChallengeSummary = z.infer<typeof challengeSummarySchema>;
