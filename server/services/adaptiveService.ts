import { storage } from "../storage";
import { Question, UserQuestionHistory } from "@shared/schema";

/**
 * Get adaptive questions for a user based on their history
 * This will prioritize:
 * 1. Questions that have been missed before (with higher priority for questions missed multiple times)
 * 2. Location-specific questions for the user's location
 * 3. Questions that haven't been seen before
 * 4. Random questions if all have been seen
 */
export async function getAdaptiveQuestions(
  userToken: string,
  count: number = 10,
  state?: string,
  city?: string
): Promise<Question[]> {
  // Get all questions
  const allQuestions = await storage.getQuestions();
  
  // Get user history
  const history = await storage.getUserQuestionHistory(userToken);
  
  // Group questions by whether they were answered correctly or not
  const correctlyAnsweredIds = new Set(
    history
      .filter(h => h.isCorrect)
      .map(h => h.questionId)
  );
  
  const incorrectlyAnswered = history
    .filter(h => !h.isCorrect)
    .reduce<Record<number, UserQuestionHistory[]>>((acc, h) => {
      if (!acc[h.questionId]) {
        acc[h.questionId] = [];
      }
      acc[h.questionId].push(h);
      return acc;
    }, {});
  
  // Get all questions IDs that have been answered (correctly or incorrectly)
  const answeredIds = new Set(history.map(h => h.questionId));
  
  // Get questions that have been correctly answered multiple times (2+)
  const multipleCorrectIds = new Set();
  const correctCounts = new Map<number, number>();
  
  for (const h of history) {
    if (h.isCorrect) {
      const count = correctCounts.get(h.questionId) || 0;
      correctCounts.set(h.questionId, count + 1);
      if (count + 1 >= 2) {
        multipleCorrectIds.add(h.questionId);
      }
    }
  }
  
  // Keep track of recently seen questions (to avoid repetition)
  const recentlySeenIds = new Set(
    history
      .sort((a, b) => b.id - a.id) // Sort by most recent first
      .slice(0, 20) // Look at last 20 questions
      .map(h => h.questionId)
  );
  
  // Function to get a score for each question (higher = more likely to be selected)
  const getQuestionScore = (question: Question): number => {
    // Start with a base score
    let score = 1;
    
    // If the question has been incorrectly answered, increase score based on how many times
    if (incorrectlyAnswered[question.id]) {
      const attempts = incorrectlyAnswered[question.id].length;
      score += attempts * 5; // Significantly increase weight for frequently missed questions
    }
    
    // If it's a location-specific question that matches the user's location, increase score
    if (question.isLocationSpecific) {
      if (state && question.locationState === state) {
        score += 2;
        
        if (city && question.locationCity === city) {
          score += 1;
        }
      }
    }
    
    // If the question has never been seen, give it a strong boost
    if (!answeredIds.has(question.id)) {
      score += 3; // Higher priority for new questions
    }
    
    // Penalize questions that have been correctly answered multiple times
    if (multipleCorrectIds.has(question.id)) {
      score -= 5; // Significantly deprioritize questions mastered (correctly answered 2+ times)
    } 
    // Slightly penalize questions correctly answered once
    else if (correctlyAnsweredIds.has(question.id)) {
      score -= 2;
    }
    
    // Penalize recently seen questions to prevent repetition
    if (recentlySeenIds.has(question.id)) {
      score -= 3; // Avoid showing questions that were recently seen
    }
    
    return score;
  };
  
  // Sort questions by their score
  const scoredQuestions = allQuestions
    .map(q => ({
      question: q,
      score: getQuestionScore(q)
    }))
    .sort((a, b) => b.score - a.score);
  
  // Separate questions into those previously missed and others
  const missedQuestions = scoredQuestions
    .filter(sq => incorrectlyAnswered[sq.question.id])
    .map(sq => sq.question);
    
  const otherQuestions = scoredQuestions
    .filter(sq => !incorrectlyAnswered[sq.question.id])
    .map(sq => sq.question);
    
  // Ensure at least 50% of questions are ones previously missed (if available)
  let selectedQuestions: Question[] = [];
  const minMissedQuestions = Math.min(Math.ceil(count * 0.5), missedQuestions.length);
  
  // Add missed questions first
  selectedQuestions = selectedQuestions.concat(missedQuestions.slice(0, minMissedQuestions));
  
  // Fill remaining slots with other questions
  const remainingSlots = count - selectedQuestions.length;
  selectedQuestions = selectedQuestions.concat(otherQuestions.slice(0, remainingSlots));
  
  // If we have a test simulation, ensure location-specific questions are included
  if (count >= 10 && state) {
    const locationSpecific = allQuestions.filter(q => 
      q.isLocationSpecific && q.locationState === state && 
      (city ? q.locationCity === city : true)
    );
    
    // Ensure at least 1 location-specific question if available
    if (locationSpecific.length > 0 && !selectedQuestions.some(q => q.isLocationSpecific)) {
      // Replace the lowest scored question with a location-specific one
      selectedQuestions.pop();
      selectedQuestions.push(locationSpecific[0]);
    }
  }
  
  // Store selected question IDs for the current test in memory to track "recent test questions"
  const lastTestQuestions = selectedQuestions.map(q => q.id);
  
  // Get previous test sessions for this user to track questions from recent tests
  const userSessions = await storage.getTestSessionsByUser(userToken);
  
  // If there are multiple tests already taken, ensure variety across tests
  if (userSessions.length > 0 && count >= 10) {
    // Get question IDs from most recent test
    const lastTestQuestionIds = new Set(userSessions[0]?.questions || []);
    
    // If too many questions from last test are in the current selection (more than 3),
    // replace some with other high-scoring questions not recently seen
    const overlapIds = selectedQuestions.filter(q => lastTestQuestionIds.has(q.id));
    
    if (overlapIds.length > 3) {
      // Find replacement questions (not in selected and not in last test)
      const replacementCandidates = allQuestions.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id) && 
        !lastTestQuestionIds.has(q.id)
      );
      
      // Get the indices of questions to replace
      const replaceIndices = overlapIds
        .slice(3) // Keep first 3 overlap questions
        .map(q => selectedQuestions.findIndex(sq => sq.id === q.id));
      
      // Replace with new questions
      for (let i = 0; i < replaceIndices.length && i < replacementCandidates.length; i++) {
        if (replaceIndices[i] !== -1) {
          selectedQuestions[replaceIndices[i]] = replacementCandidates[i];
        }
      }
    }
  }
  
  // Shuffle the questions to avoid predictable order
  return shuffleArray(selectedQuestions);
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
