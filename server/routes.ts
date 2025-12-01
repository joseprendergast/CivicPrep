import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, generateUserToken } from "./storage";
import { loadQuestions } from "./services/questions";
import { getAdaptiveQuestions } from "./services/adaptiveService";
import { 
  submitAnswerSchema, 
  insertTestSessionSchema,
  testResultSchema,
  userStatsSchema,
  TEST_TYPES
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Load all questions into memory on startup
  await loadQuestions();

  // Get all questions
  app.get("/api/questions", async (_req: Request, res: Response) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get a single question by ID
  app.get("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestionById(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Generate a new test (practice or simulation)
  app.post("/api/tests", async (req: Request, res: Response) => {
    try {
      const { userToken, testType } = req.body;
      
      if (!userToken || !testType || (testType !== "practice" && testType !== "simulation")) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }

      // Get user progress or create if it doesn't exist
      let userProgress = await storage.getUserProgress(userToken);
      if (!userProgress) {
        userProgress = await storage.createUserProgress({
          userToken,
          testsTaken: 0,
          questionsAnswered: 0,
          correctAnswers: 0
        });
      }

      // Get all questions and previous test questions
      const allQuestions = await storage.getQuestions();
      const userSessions = await storage.getTestSessionsByUser(userToken);
      
      let selectedQuestions = [];
      const questionCount = testType === "simulation" ? 10 : 1;

      // Enhanced randomization for simulation tests
      if (testType === "simulation") {
        // Collect previously seen questions from all past sessions
        const pastQuestionIds = new Set<number>();
        const recentTestIds = new Set<number>();
        
        // Track most recently seen questions separately
        if (userSessions.length > 0 && userSessions[0].questions) {
          const mostRecentTestQuestions = Array.isArray(userSessions[0].questions) 
            ? userSessions[0].questions as number[]
            : [];
            
          // Add most recent test questions to a separate set
          for (const id of mostRecentTestQuestions) {
            recentTestIds.add(Number(id));
          }
        }
        
        // Track all past questions from all sessions
        for (const session of userSessions) {
          if (session.questions) {
            const sessionQuestions = Array.isArray(session.questions) 
              ? session.questions as number[]
              : [];
              
            for (const id of sessionQuestions) {
              pastQuestionIds.add(Number(id));
            }
          }
        }
        
        // Get questions divided into categories:
        // 1. Never seen questions
        // 2. Previously seen but not in most recent test
        // 3. Questions from most recent test (try to avoid these most)
        const neverSeenQuestions = allQuestions.filter(q => !pastQuestionIds.has(q.id));
        const previouslySeenQuestions = allQuestions.filter(q => 
          pastQuestionIds.has(q.id) && !recentTestIds.has(q.id));
        const recentQuestions = allQuestions.filter(q => recentTestIds.has(q.id));
        
        // Shuffle all categories for maximum randomization
        const shuffledNeverSeen = shuffleArray([...neverSeenQuestions]);
        const shuffledPreviouslySeen = shuffleArray([...previouslySeenQuestions]);
        const shuffledRecent = shuffleArray([...recentQuestions]);
        
        // Prioritize questions that have never been seen
        // Then questions from previous tests but not the most recent
        // Only use questions from most recent test if necessary
        let questionPool = [];
        
        // Add at least 6 never-seen questions if possible
        const neverSeenCount = Math.min(6, shuffledNeverSeen.length);
        questionPool.push(...shuffledNeverSeen.slice(0, neverSeenCount));
        
        // Add previously seen (but not recent) questions next
        const previouslySeenCount = Math.min(3, shuffledPreviouslySeen.length);
        questionPool.push(...shuffledPreviouslySeen.slice(0, previouslySeenCount));
        
        // If we still need more questions, add some from recent test
        const remaining = 10 - questionPool.length;
        if (remaining > 0) {
          questionPool.push(...shuffledRecent.slice(0, remaining));
        }
        
        // Shuffle one final time to mix the categories
        questionPool = shuffleArray(questionPool);
        
        // Take exactly 10 questions
        selectedQuestions = questionPool.slice(0, 10);
        
        // If we still don't have 10 questions, fall back to adaptive algorithm
        if (selectedQuestions.length < 10) {
          selectedQuestions = await getAdaptiveQuestions(userToken, questionCount, "New Jersey", "Weehawken");
        }
      } else {
        // Practice mode - use adaptive algorithm to get questions user might struggle with
        selectedQuestions = await getAdaptiveQuestions(userToken, questionCount, "New Jersey", "Weehawken");
      }
      
      // Use the global shuffleArray function defined outside this route handler

      // Create a new test session
      const testSession = await storage.createTestSession({
        userToken,
        testType,
        questions: selectedQuestions.map(q => q.id),
        answers: [],
        score: 0,
        passed: null
      });

      // If practice mode, just return one question
      // If test simulation, return all 10 questions
      const response = {
        testId: testSession.id,
        questions: selectedQuestions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          category: q.category,
          subcategory: q.subcategory
        }))
      };

      // Update user stats
      await storage.updateUserProgress(userToken, {
        testsTaken: userProgress.testsTaken + (testType === "simulation" ? 1 : 0)
      });

      res.json(response);
    } catch (error) {
      console.error("Error creating test:", error);
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  // Submit an answer for a question
  app.post("/api/tests/:testId/answers", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.testId);
      const { userToken, questionId, selectedOptionId } = req.body;
      
      // Validate request
      if (!userToken || !questionId || !selectedOptionId) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }

      // Get the test session
      const testSession = await storage.getTestSession(testId);
      if (!testSession) {
        return res.status(404).json({ message: "Test session not found" });
      }

      // Get the question
      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check if the answer is correct
      const questionOpts = question.options as any[];
      const selectedOption = questionOpts.find(opt => opt.id === selectedOptionId);
      if (!selectedOption) {
        return res.status(400).json({ message: "Selected option not found" });
      }

      const isCorrect = selectedOption.isCorrect === true;

      // Update user progress
      let userProgress = await storage.getUserProgress(userToken);
      if (!userProgress) {
        userProgress = await storage.createUserProgress({
          userToken,
          testsTaken: 0,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0
        });
      } else {
        userProgress = await storage.updateUserProgress(userToken, {
          questionsAnswered: userProgress.questionsAnswered + 1,
          correctAnswers: userProgress.correctAnswers + (isCorrect ? 1 : 0)
        });
      }

      // Update or create question history
      let questionHistory = await storage.getQuestionHistory(userToken, questionId);
      if (questionHistory) {
        questionHistory = await storage.updateQuestionHistory(questionHistory.id, {
          isCorrect,
          attemptCount: questionHistory.attemptCount + 1
        });
      } else {
        questionHistory = await storage.createQuestionHistory({
          userToken,
          questionId,
          isCorrect,
          attemptCount: 1,
          lastAttemptDate: new Date()
        });
      }

      // Update test session answers
      const sessionAnswers = testSession.answers as any[] || [];
      const updatedAnswers = [...sessionAnswers, {
        questionId,
        selectedOptionId,
        isCorrect
      }];
      
      const score = updatedAnswers.filter(a => a.isCorrect).length;
      const passed = updatedAnswers.length >= 10 ? score >= 6 : undefined;
      
      // Handle updates when test is completed
      const isCompleted = updatedAnswers.length >= 10;
      const updates: any = {
        answers: updatedAnswers,
        score
      };
      
      if (isCompleted) {
        updates.passed = passed;
        updates.completedAt = new Date();
      }
      
      await storage.updateTestSession(testId, updates);

      // Get the correct option for feedback
      const questionOptions = question.options as any[];
      const correctOption = questionOptions.find(opt => opt.isCorrect === true);

      // Prepare response
      const response = {
        isCorrect,
        correctOption,
        selectedOption,
        explanation: question.explanation
      };

      res.json(response);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Get test results
  app.get("/api/tests/:testId/results", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.testId);
      
      // Get the test session
      const testSession = await storage.getTestSession(testId);
      if (!testSession) {
        return res.status(404).json({ message: "Test session not found" });
      }

      // Get all questions in this test
      const sessionQuestions = testSession.questions as number[];
      const questions = await storage.getQuestionsByIds(sessionQuestions);
      
      // Build result data
      const result = {
        testId,
        score: testSession.score,
        totalQuestions: sessionQuestions.length,
        passed: testSession.passed,
        questions: sessionQuestions.map(qId => {
          const question = questions.find(q => q.id === qId);
          if (!question) {
            throw new Error(`Question ${qId} not found`);
          }
          
          const sessionAnswers = testSession.answers as any[] || [];
          const answer = sessionAnswers.find(a => a.questionId === qId);
          const questionOptionsList = question.options as any[];
          const correctOption = questionOptionsList.find(opt => opt.isCorrect === true);
          const selectedOption = answer 
            ? questionOptionsList.find(opt => opt.id === answer.selectedOptionId) 
            : null;
          
          return {
            id: qId,
            text: question.text,
            correctOption,
            selectedOption: selectedOption || null,
            isCorrect: answer ? answer.isCorrect : false
          };
        })
      };

      res.json(result);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  // Get user stats
  app.get("/api/user/:userToken/stats", async (req: Request, res: Response) => {
    try {
      const { userToken } = req.params;
      
      // Get user stats
      const stats = await storage.getUserStats(userToken);
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Generate a new user token
  app.post("/api/user/token", (_req: Request, res: Response) => {
    try {
      const userToken = generateUserToken();
      res.json({ userToken });
    } catch (error) {
      console.error("Error generating user token:", error);
      res.status(500).json({ message: "Failed to generate user token" });
    }
  });
  
  // ===== Challenge Mode API Routes =====
  
  // Create a new challenge
  // Helper function to shuffle an array (Fisher-Yates algorithm)
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  app.post("/api/challenge", async (req: Request, res: Response) => {
    try {
      const { userToken } = req.body;
      
      if (!userToken) {
        return res.status(400).json({ message: "User token is required" });
      }
      
      // Generate a unique ID for this challenge
      const challengeGroupId = generateUserToken();
      
      // Get 10 random questions for the first round using our new randomization logic
      const questionIds = await storage.generateChallengeQuestions(
        userToken,
        1,
        challengeGroupId
      );
      
      console.log(`New challenge ${challengeGroupId}: Starting with random 10 questions: ${questionIds.join(', ')}`);
      
      // Get the full question objects
      const questions = await storage.getQuestionsByIds(questionIds);
      
      // Create a test session for the first round
      const testSession = await storage.createTestSession({
        userToken,
        testType: TEST_TYPES.CHALLENGE,
        questions: questionIds,
        answers: [],
        score: 0,
        passed: null,
        challengeRound: 1,
        challengeGroupId
      });
      
      res.json({
        challengeId: challengeGroupId,
        testId: testSession.id,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          category: q.category,
          subcategory: q.subcategory
        }))
      });
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });
  
  // Get challenge status
  app.get("/api/challenge/:challengeId/status", async (req: Request, res: Response) => {
    try {
      const { challengeId } = req.params;
      
      // Get challenge stats
      const stats = await storage.getChallengeStats(challengeId);
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting challenge status:", error);
      res.status(500).json({ message: "Failed to get challenge status" });
    }
  });
  
  // Start next round of challenge
  app.post("/api/challenge/:challengeId/next-round", async (req: Request, res: Response) => {
    try {
      const { challengeId } = req.params;
      const { userToken, round } = req.body;
      
      if (!userToken || !round) {
        return res.status(400).json({ message: "User token and round are required" });
      }
      
      // Get challenge stats to check remaining questions
      const stats = await storage.getChallengeStats(challengeId);
      
      // If challenge is already completed, return the stats
      if (stats.completed) {
        return res.json({ 
          summary: stats
        });
      }
      
      console.log(`Starting round ${round + 1} for challenge ${challengeId}`);
      
      // Generate 10 random questions for next round (ensuring no repetition from previous rounds)
      const questionIds = await storage.generateChallengeQuestions(
        userToken, 
        round + 1, 
        challengeId
      );
      
      console.log(`Selected ${questionIds.length} questions for round ${round + 1}`);
      console.log(`Question IDs: ${questionIds.join(', ')}`);
      
      // Get the full question objects
      const questions = await storage.getQuestionsByIds(questionIds);
      
      // Create a test session for this round
      const testSession = await storage.createTestSession({
        userToken,
        testType: TEST_TYPES.CHALLENGE,
        questions: questionIds,
        answers: [],
        score: 0,
        passed: null,
        challengeRound: round + 1,
        challengeGroupId: challengeId
      });
      
      res.json({
        challengeId,
        testId: testSession.id,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          category: q.category,
          subcategory: q.subcategory
        }))
      });
    } catch (error) {
      console.error("Error starting next challenge round:", error);
      res.status(500).json({ message: "Failed to start next challenge round" });
    }
  });
  
  // Get current challenge test
  app.get("/api/challenge/:challengeId/current-test", async (req: Request, res: Response) => {
    try {
      const { challengeId } = req.params;
      
      // Get all sessions for this challenge
      const sessions = await storage.getChallengeSessionsByGroupId(challengeId);
      
      if (sessions.length === 0) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Find the latest uncompleted session
      const latestSession = sessions.find(s => !s.completedAt);
      
      if (!latestSession) {
        // All sessions are completed, we need to start a new round
        return res.json({ currentRoundCompleted: true });
      }
      
      // Get the questions for this session
      const questions = await storage.getQuestionsByIds(latestSession.questions as number[]);
      
      res.json({
        challengeId,
        testId: latestSession.id,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          category: q.category,
          subcategory: q.subcategory
        }))
      });
    } catch (error) {
      console.error("Error getting current challenge test:", error);
      res.status(500).json({ message: "Failed to get current challenge test" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
