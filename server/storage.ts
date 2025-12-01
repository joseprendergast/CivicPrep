import { 
  questions, Question, InsertQuestion, 
  userProgress, UserProgress, InsertUserProgress,
  userQuestionHistory, UserQuestionHistory, InsertUserQuestionHistory,
  testSessions, TestSession, InsertTestSession,
  UserStats, ChallengeSummary
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  getQuestionsByIds(ids: number[]): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getLocationSpecificQuestions(state?: string, city?: string): Promise<Question[]>;

  // User Progress
  getUserProgress(userToken: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userToken: string, stats: { 
    testsTaken?: number; 
    questionsAnswered?: number; 
    correctAnswers?: number; 
  }): Promise<UserProgress>;

  // User Question History
  getUserQuestionHistory(userToken: string): Promise<UserQuestionHistory[]>;
  getQuestionHistory(userToken: string, questionId: number): Promise<UserQuestionHistory | undefined>;
  createQuestionHistory(history: InsertUserQuestionHistory): Promise<UserQuestionHistory>;
  updateQuestionHistory(id: number, updates: {
    isCorrect?: boolean;
    attemptCount?: number;
  }): Promise<UserQuestionHistory>;

  // Test Sessions
  getTestSession(id: number): Promise<TestSession | undefined>;
  getLastTestSession(userToken: string): Promise<TestSession | undefined>;
  getTestSessionsByUser(userToken: string): Promise<TestSession[]>;
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  updateTestSession(id: number, updates: {
    answers?: any[];
    score?: number;
    passed?: boolean;
    completedAt?: Date;
  }): Promise<TestSession>;

  // Challenge Sessions
  getChallengeSessionsByGroupId(challengeGroupId: string): Promise<TestSession[]>;
  getLatestChallengeSession(userToken: string): Promise<TestSession | undefined>;
  getChallengeStats(challengeGroupId: string): Promise<ChallengeSummary>;
  generateChallengeQuestions(userToken: string, round: number, challengeGroupId: string, remainingQuestionIds?: number[]): Promise<number[]>;

  // Statistics
  getUserStats(userToken: string): Promise<UserStats>;
}

// Memory Storage Implementation
export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private userProgress: Map<string, UserProgress>;
  private userQuestionHistory: Map<number, UserQuestionHistory>;
  private testSessions: Map<number, TestSession>;
  private questionIdCounter: number;
  private historyIdCounter: number;
  private sessionIdCounter: number;

  constructor() {
    this.questions = new Map();
    this.userProgress = new Map();
    this.userQuestionHistory = new Map();
    this.testSessions = new Map();
    this.questionIdCounter = 1;
    this.historyIdCounter = 1;
    this.sessionIdCounter = 1;
  }

  // Questions
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByIds(ids: number[]): Promise<Question[]> {
    return ids
      .map(id => this.questions.get(id))
      .filter((q): q is Question => q !== undefined);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionIdCounter++;
    const newQuestion = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async getLocationSpecificQuestions(state?: string, city?: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => {
      if (!q.isLocationSpecific) return false;
      if (state && q.locationState !== state) return false;
      if (city && q.locationCity !== city) return false;
      return true;
    });
  }

  // User Progress
  async getUserProgress(userToken: string): Promise<UserProgress | undefined> {
    return this.userProgress.get(userToken);
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const newProgress = {
      ...progress,
      id: 1, // In-memory store only needs one per user
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProgress.set(progress.userToken, newProgress);
    return newProgress;
  }

  async updateUserProgress(
    userToken: string,
    stats: {
      testsTaken?: number;
      questionsAnswered?: number;
      correctAnswers?: number;
    }
  ): Promise<UserProgress> {
    const current = this.userProgress.get(userToken);
    if (!current) {
      throw new Error(`User progress not found for token ${userToken}`);
    }

    const updated = {
      ...current,
      ...stats,
      updatedAt: new Date(),
    };
    this.userProgress.set(userToken, updated);
    return updated;
  }

  // User Question History
  async getUserQuestionHistory(userToken: string): Promise<UserQuestionHistory[]> {
    return Array.from(this.userQuestionHistory.values()).filter(
      h => h.userToken === userToken
    );
  }

  async getQuestionHistory(
    userToken: string,
    questionId: number
  ): Promise<UserQuestionHistory | undefined> {
    return Array.from(this.userQuestionHistory.values()).find(
      h => h.userToken === userToken && h.questionId === questionId
    );
  }

  async createQuestionHistory(history: InsertUserQuestionHistory): Promise<UserQuestionHistory> {
    const id = this.historyIdCounter++;
    const newHistory = {
      ...history,
      id,
      lastAttemptDate: new Date(),
    };
    this.userQuestionHistory.set(id, newHistory);
    return newHistory;
  }

  async updateQuestionHistory(
    id: number,
    updates: {
      isCorrect?: boolean;
      attemptCount?: number;
    }
  ): Promise<UserQuestionHistory> {
    const current = this.userQuestionHistory.get(id);
    if (!current) {
      throw new Error(`Question history not found for id ${id}`);
    }

    const updated = {
      ...current,
      ...updates,
      lastAttemptDate: new Date(),
    };
    this.userQuestionHistory.set(id, updated);
    return updated;
  }

  // Test Sessions
  async getTestSession(id: number): Promise<TestSession | undefined> {
    return this.testSessions.get(id);
  }

  async getLastTestSession(userToken: string): Promise<TestSession | undefined> {
    const userSessions = Array.from(this.testSessions.values())
      .filter(s => s.userToken === userToken)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
    return userSessions[0];
  }
  
  async getTestSessionsByUser(userToken: string): Promise<TestSession[]> {
    return Array.from(this.testSessions.values())
      .filter(s => s.userToken === userToken)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const id = this.sessionIdCounter++;
    const newSession = {
      ...session,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.testSessions.set(id, newSession);
    return newSession;
  }

  async updateTestSession(
    id: number,
    updates: {
      answers?: any[];
      score?: number;
      passed?: boolean;
      completedAt?: Date;
    }
  ): Promise<TestSession> {
    const current = this.testSessions.get(id);
    if (!current) {
      throw new Error(`Test session not found for id ${id}`);
    }

    const updated = {
      ...current,
      ...updates,
    };
    this.testSessions.set(id, updated);
    return updated;
  }

  // Challenge Sessions
  async getChallengeSessionsByGroupId(challengeGroupId: string): Promise<TestSession[]> {
    return Array.from(this.testSessions.values())
      .filter(s => s.challengeGroupId === challengeGroupId)
      .sort((a, b) => {
        // Sort by challenge round
        return (a.challengeRound || 0) - (b.challengeRound || 0);
      });
  }

  async getLatestChallengeSession(userToken: string): Promise<TestSession | undefined> {
    const userSessions = Array.from(this.testSessions.values())
      .filter(s => s.userToken === userToken && s.testType === 'challenge')
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
    return userSessions[0];
  }

  async getChallengeStats(challengeGroupId: string): Promise<ChallengeSummary> {
    // Get all sessions for this challenge group
    const sessions = await this.getChallengeSessionsByGroupId(challengeGroupId);
    
    if (sessions.length === 0) {
      throw new Error(`No challenge sessions found for group ID ${challengeGroupId}`);
    }
    
    const userToken = sessions[0].userToken;
    const allQuestions = await this.getQuestions();
    
    // Get all question IDs that have been part of this challenge
    const seenQuestionIds = new Set<number>();
    sessions.forEach(session => {
      const questions = session.questions as number[];
      questions.forEach(qId => seenQuestionIds.add(qId));
    });
    
    // Find questions that have not been seen yet in this challenge
    const remainingQuestionIds = allQuestions
      .map(q => q.id)
      .filter(id => !seenQuestionIds.has(id));
    
    // Calculate total questions answered and correct
    let totalQuestionsAnswered = 0;
    let totalQuestionsCorrect = 0;
    const missedQuestions: { 
      id: number; 
      text: string; 
      correctAnswer: string; 
      isCorrect: boolean; 
      testRound: number;
    }[] = [];
    
    // Process each session to get stats
    for (const session of sessions) {
      const questions = await this.getQuestionsByIds(session.questions as number[]);
      const answers = session.answers as { questionId: number; isCorrect: boolean }[];
      
      totalQuestionsAnswered += answers.length;
      
      for (const answer of answers) {
        if (answer.isCorrect) {
          totalQuestionsCorrect++;
        } else {
          const question = questions.find(q => q.id === answer.questionId);
          if (question) {
            missedQuestions.push({
              id: question.id,
              text: question.text,
              correctAnswer: question.correctAnswer,
              isCorrect: answer.isCorrect,
              testRound: session.challengeRound || 0
            });
          }
        }
      }
    }
    
    const latestSession = sessions[sessions.length - 1];
    const currentRound = (latestSession.challengeRound || 0) + (latestSession.completedAt ? 1 : 0);
    
    // Check if challenge is completed - only if we've completed all 10 rounds
    const completed = currentRound > 10 || (currentRound > 0 && remainingQuestionIds.length === 0);
    
    // Determine if the current round has been completed
    const currentRoundCompleted = latestSession.completedAt ? true : false;
    
    return {
      challengeId: challengeGroupId,
      completed,
      currentRoundCompleted,
      round: Math.min(currentRound, 10), // Cap at 10
      totalQuestionsAnswered,
      totalQuestionsCorrect,
      correctPercentage: totalQuestionsAnswered > 0 
        ? Math.round((totalQuestionsCorrect / totalQuestionsAnswered) * 100) 
        : 0,
      missedQuestions,
      remainingQuestions: remainingQuestionIds
    };
  }

  async generateChallengeQuestions(
    userToken: string, 
    round: number, 
    challengeGroupId: string, 
    remainingQuestionIds?: number[]
  ): Promise<number[]> {
    // New approach: Randomly select 10 questions from the remaining pool
    // to ensure a full coverage of all 100 questions without repetition
    
    // First, get all sessions for this challenge to see which questions have been used
    const sessions = await this.getChallengeSessionsByGroupId(challengeGroupId);
    
    // Collect all question IDs that have already been used in previous rounds
    const usedQuestionIds = new Set<number>();
    for (const session of sessions) {
      const questions = session.questions as number[];
      for (const qId of questions) {
        usedQuestionIds.add(qId);
      }
    }
    
    // Get all available questions
    const allQuestions = await this.getQuestions();
    
    // Filter out questions that have already been used
    const availableQuestions = allQuestions
      .filter(q => !usedQuestionIds.has(q.id))
      .map(q => q.id);
    
    console.log(`Challenge ${challengeGroupId}: Round ${round} - ${availableQuestions.length} available questions`);
    
    // If we have 10 or more questions available, select 10 random ones
    if (availableQuestions.length >= 10) {
      // Shuffle the available questions
      const shuffledQuestions = this.shuffleArray([...availableQuestions]);
      
      // Take the first 10
      const selectedQuestions = shuffledQuestions.slice(0, 10);
      
      console.log(`Challenge ${challengeGroupId}: Selected questions ${selectedQuestions.join(', ')}`);
      return selectedQuestions;
    } 
    // If we have fewer than 10 questions available, use all remaining ones
    else if (availableQuestions.length > 0) {
      console.log(`Challenge ${challengeGroupId}: Selected remaining questions ${availableQuestions.join(', ')}`);
      return availableQuestions;
    }
    // If no questions are available (all 100 have been used), start over with a fresh set
    else {
      console.log(`Challenge ${challengeGroupId}: All questions used, challenge should be complete`);
      // Return an empty array to indicate completion
      return [];
    }
  }
  
  // Helper method to shuffle an array
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Statistics
  async getUserStats(userToken: string): Promise<UserStats> {
    const progress = await this.getUserProgress(userToken);
    const history = await this.getUserQuestionHistory(userToken);
    
    if (!progress) {
      return {
        testsTaken: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        correctPercentage: 0,
        missedQuestions: [],
      };
    }

    // Find missed questions
    const missedQuestionIds = Array.from(new Set(
      history
        .filter(h => !h.isCorrect)
        .map(h => h.questionId)
    ));

    const missedQuestions = await Promise.all(
      missedQuestionIds.map(async qId => {
        const question = await this.getQuestionById(qId);
        const qHistory = history.filter(h => h.questionId === qId);
        const attemptCount = qHistory.length;
        
        if (!question) {
          throw new Error(`Question not found for id ${qId}`);
        }

        return {
          id: qId,
          text: question.text,
          correctAnswer: question.correctAnswer,
          attemptCount,
        };
      })
    );

    // Sort by attempt count (most attempts first)
    missedQuestions.sort((a, b) => b.attemptCount - a.attemptCount);

    return {
      testsTaken: progress.testsTaken,
      questionsAnswered: progress.questionsAnswered,
      correctAnswers: progress.correctAnswers,
      correctPercentage: progress.questionsAnswered > 0 
        ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100) 
        : 0,
      missedQuestions,
    };
  }
}

export const storage = new MemStorage();

// Helper function to generate a unique user token (for client-side storage)
export function generateUserToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
