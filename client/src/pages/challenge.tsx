import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import QuestionCard from "@/components/question-card";
import ProgressIndicator from "@/components/progress-indicator";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Award, AlertTriangle } from "lucide-react";

interface ChallengeProps {
  userToken: string | null;
}

interface ChallengeSummary {
  challengeId: string;
  completed: boolean;
  round: number;
  totalQuestionsAnswered: number;
  totalQuestionsCorrect: number;
  correctPercentage: number;
  missedQuestions: {
    id: number;
    text: string;
    correctAnswer: string;
    isCorrect: boolean;
    testRound: number;
  }[];
  remainingQuestions?: number[];
}

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  category: string;
  subcategory: string;
}

export default function Challenge({ userToken }: ChallengeProps) {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOption: any;
    selectedOption: any;
    explanation: string;
  } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isSummaryView, setIsSummaryView] = useState(false);

  // Fetch or create a challenge test session
  const { data: testData, isLoading: testLoading } = useQuery({
    queryKey: ["challenge-test", userToken, challengeId, currentRound],
    queryFn: async () => {
      try {
        // If we have a challenge in progress, fetch its latest data
        if (challengeId) {
          // Get challenge status
          const statusResponse = await fetch(`/api/challenge/${challengeId}/status`, {
            credentials: "include"
          });
          
          if (!statusResponse.ok) {
            throw new Error(`Error fetching challenge status: ${statusResponse.status}`);
          }
          
          const challengeData = await statusResponse.json();
          console.log("Challenge status:", challengeData);
          
          setCurrentRound(challengeData.round);
          
          if (challengeData.completed) {
            setCompleted(true);
            setIsSummaryView(true);
            return {
              summary: challengeData
            };
          }
          
          // If the current round is already completed, create the next one
          if (challengeData.currentRoundCompleted) {
            const nextRoundResponse = await fetch(`/api/challenge/${challengeId}/next-round`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userToken,
                round: challengeData.round
              }),
              credentials: "include"
            });
            
            if (!nextRoundResponse.ok) {
              throw new Error(`Error creating next round: ${nextRoundResponse.status}`);
            }
            
            return await nextRoundResponse.json();
          }
          
          // Otherwise, get the current in-progress test
          const currentTestResponse = await fetch(`/api/challenge/${challengeId}/current-test`, {
            credentials: "include"
          });
          
          if (!currentTestResponse.ok) {
            throw new Error(`Error fetching current test: ${currentTestResponse.status}`);
          }
          
          return await currentTestResponse.json();
          
        } else {
          // Create a new challenge
          const challengeResponse = await fetch("/api/challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userToken }),
            credentials: "include"
          });
          
          if (!challengeResponse.ok) {
            throw new Error(`Error creating challenge: ${challengeResponse.status}`);
          }
          
          const data = await challengeResponse.json();
          console.log("Created new challenge:", data);
          
          setChallengeId(data.challengeId);
          setCurrentRound(1);
          return data;
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
        toast({
          title: "Error",
          description: "Failed to start the challenge. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!userToken
  });

  // Submit answer mutation
  const submitMutation = useMutation({
    mutationFn: async ({ questionId, selectedOptionId }: { questionId: number; selectedOptionId: string }) => {
      if (!challengeId || !testData?.testId) {
        throw new Error("No active test session");
      }
      
      try {
        const response = await fetch(`/api/tests/${testData.testId}/answers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userToken,
            questionId,
            selectedOptionId
          }),
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Submit answer error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setFeedback({
        isCorrect: data.isCorrect,
        correctOption: data.correctOption,
        selectedOption: data.selectedOption,
        explanation: data.explanation || ""
      });
      
      // Update the cache to reflect the new answer
      queryClient.invalidateQueries({ queryKey: ["challenge-test", userToken, challengeId, currentRound] });
    },
    onError: (error) => {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Complete test mutation
  const completeTestMutation = useMutation({
    mutationFn: async () => {
      if (!testData?.testId) {
        throw new Error("No active test session");
      }
      
      try {
        const response = await fetch(`/api/tests/${testData.testId}/results`, {
          method: "GET",
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Complete test error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Test completed successfully:", data);
      
      // After completing a round, refresh the challenge data
      queryClient.invalidateQueries({ queryKey: ["challenge-test", userToken, challengeId, currentRound] });
      
      // Move to the next round or show summary if completed
      if (currentRound >= 10) {
        setCompleted(true);
        setIsSummaryView(true);
      } else {
        setCurrentRound(prev => prev + 1);
        setCurrentQuestion(0);
      }
    },
    onError: (error) => {
      console.error("Complete test error:", error);
      toast({
        title: "Error",
        description: "Failed to complete the test. Please try again.",
        variant: "destructive"
      });
    }
  });

  function handleSelectOption(optionId: string) {
    if (feedback) return; // Don't allow changing once submitted
    setSelectedOption(optionId);
  }

  function handleSubmitAnswer() {
    // If no selected option or questions data, or if there's already a submission in progress or feedback, don't proceed
    if (!testData?.questions || submitMutation.isPending || feedback) return;
    
    // If no option is selected yet, exit silently
    if (!selectedOption) return;
    
    const currentQuestionData = testData.questions[currentQuestion];
    
    // Submit the answer
    submitMutation.mutate({
      questionId: currentQuestionData.id,
      selectedOptionId: selectedOption
    });
  }

  function handleNextQuestion() {
    setSelectedOption(null);
    setFeedback(null);
    
    if (currentQuestion < (testData?.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete the test round
      completeTestMutation.mutate();
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestion > 0) {
      setSelectedOption(null);
      setFeedback(null);
      setCurrentQuestion(prev => prev - 1);
    }
  }

  if (!userToken) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>100 Questions Challenge</CardTitle>
          <CardDescription>
            You need to be logged in to take the challenge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (testLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Loading Challenge...</CardTitle>
          <CardDescription>
            Please wait while we prepare your 100 questions challenge.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="animate-pulse h-40 w-full bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  // If in summary view, display the challenge summary
  if (isSummaryView && testData?.summary) {
    const summary = testData.summary as ChallengeSummary;
    
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              {summary.correctPercentage >= 80 ? (
                <Award className="h-16 w-16 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              {summary.completed
                ? "Challenge Completed!"
                : `Challenge Part ${summary.round} of 10`}
            </CardTitle>
            <CardDescription className="text-lg">
              You've answered {summary.totalQuestionsCorrect} out of {summary.totalQuestionsAnswered} questions correctly 
              ({summary.correctPercentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Your Progress</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="font-semibold">{summary.totalQuestionsAnswered}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Correct Answers</p>
                    <p className="font-semibold">{summary.totalQuestionsCorrect}</p>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary"
                    style={{ width: `${summary.totalQuestionsAnswered}%` }}
                  ></div>
                </div>
              </div>
              
              {summary.missedQuestions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Missed Questions</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {summary.missedQuestions.map((q) => (
                      <div key={q.id} className="bg-muted p-3 rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">{q.text}</p>
                            <p className="text-green-600 mt-1">
                              <span className="font-medium">Correct answer:</span> {q.correctAnswer}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              Part {q.testRound} of 10
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {summary.completed ? (
              <Button 
                onClick={() => {
                  setChallengeId(null);
                  setCurrentRound(1);
                  setCompleted(false);
                  setIsSummaryView(false);
                }}
              >
                Start New Challenge
              </Button>
            ) : (
              <Button 
                onClick={() => setIsSummaryView(false)}
              >
                Continue Challenge
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Regular question view
  if (!testData?.questions || testData.questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>No Questions Available</CardTitle>
          <CardDescription>
            We couldn't load the questions for this challenge. Please try again.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 px-3">
      <div className="flex flex-row justify-between items-center mb-3">
        <div>
          <h2 className="text-xl font-semibold">100 Questions Challenge</h2>
          <div className="flex items-center">
            <p className="text-muted-foreground text-sm">
              Part {currentRound} of 10 (10 questions each)
            </p>
            <Button
              variant="link"
              size="sm"
              className="text-primary py-0 ml-2"
              onClick={() => {
                setIsSummaryView(true);
                window.scrollTo(0, 0);
              }}
            >
              View Progress
            </Button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Question {currentQuestion + 1}/{testData.questions.length}</p>
        </div>
      </div>
      
      <ProgressIndicator 
        currentQuestion={currentQuestion + 1} 
        totalQuestions={testData.questions.length} 
      />
      
      <div className="mt-2">
        <QuestionCard
          question={testData.questions[currentQuestion]}
          selectedOption={selectedOption}
          feedback={feedback}
          onSelectOption={(optionId) => {
            if (feedback || submitMutation.isPending) return; // Don't allow actions during submission or feedback
            
            // First, set the selection
            setSelectedOption(optionId);
            
            // Then immediately submit the answer using the ID that was just clicked
            // Don't rely on the state update which happens asynchronously
            const currentQuestionData = testData?.questions?.[currentQuestion];
            if (currentQuestionData) {
              submitMutation.mutate({
                questionId: currentQuestionData.id,
                selectedOptionId: optionId // Use the option ID directly instead of the state
              });
            }
          }}
          isSubmitting={submitMutation.isPending}
          onNext={handleNextQuestion}
          showPrevious={currentQuestion > 0}
          onPrevious={handlePreviousQuestion}
          isPreviousDisabled={currentQuestion === 0}
          isNextDisabled={!feedback}
        />
      </div>
    </div>
  );
}