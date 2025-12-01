import { apiRequest } from "./queryClient";
import { QuestionOption, SubmitAnswer, TestResult, UserStats } from "@shared/schema";

// API functions for the application
export const api = {
  // Get user stats
  getUserStats: async (userToken: string): Promise<UserStats> => {
    const res = await fetch(`/api/user/${userToken}/stats`);
    if (!res.ok) {
      throw new Error(`Failed to fetch user stats: ${res.statusText}`);
    }
    return res.json();
  },

  // Create a new test (practice or simulation)
  createTest: async (userToken: string, testType: "practice" | "simulation") => {
    const res = await apiRequest("POST", "/api/tests", { userToken, testType });
    return res.json();
  },

  // Submit an answer
  submitAnswer: async (testId: number, userToken: string, questionId: number, selectedOptionId: string) => {
    const res = await apiRequest("POST", `/api/tests/${testId}/answers`, {
      userToken,
      questionId,
      selectedOptionId,
    });
    return res.json();
  },

  // Get test results
  getTestResults: async (testId: number): Promise<TestResult> => {
    const res = await fetch(`/api/tests/${testId}/results`);
    if (!res.ok) {
      throw new Error(`Failed to fetch test results: ${res.statusText}`);
    }
    return res.json();
  },
};
