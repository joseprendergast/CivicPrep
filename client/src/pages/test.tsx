import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { QuestionOption } from "@shared/schema";
import QuestionCard from "@/components/question-card";
import ProgressIndicator from "@/components/progress-indicator";

interface TestProps {
  userToken: string | null;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  category: string;
  subcategory: string;
}

export default function Test({ userToken }: TestProps) {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOption: QuestionOption;
    selectedOption: QuestionOption;
    explanation: string;
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: number;
    selectedOptionId: string;
    isCorrect: boolean;
  }[]>([]);
  const { toast } = useToast();

  // Start a test simulation
  useEffect(() => {
    if (!userToken) return;

    setLoading(true);
    api.createTest(userToken, "simulation")
      .then(data => {
        setTestId(data.testId);
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error starting test:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start the test. Please try again.",
        });
        setLoading(false);
        navigate("/");
      });
  }, [userToken, navigate, toast]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || !testId || !userToken || feedback) return;
    
    // Set the selection first
    setSelectedOption(optionId);
    
    // Immediately submit the answer (single click behavior)
    api.submitAnswer(testId, userToken, currentQuestion.id, optionId)
      .then(response => {
        setFeedback(response);
        setUserAnswers([
          ...userAnswers,
          {
            questionId: currentQuestion.id,
            selectedOptionId: optionId,
            isCorrect: response.isCorrect
          }
        ]);
      })
      .catch(error => {
        console.error("Error submitting answer:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit your answer. Please try again.",
        });
      });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Reset state for the previous question
      const prevAnswer = userAnswers.find(a => a.questionId === questions[currentQuestionIndex - 1].id);
      setSelectedOption(prevAnswer?.selectedOptionId || null);
      setFeedback(null); // Clear feedback when going back
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      // End of test, go to results
      if (testId) {
        navigate(`/results/${testId}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Test Simulation</h2>
          <div className="bg-blue-50 py-1 px-3 rounded-full">
            <span className="font-medium text-primary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
        
        <ProgressIndicator 
          currentQuestion={currentQuestionIndex + 1} 
          totalQuestions={questions.length} 
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedOption={selectedOption}
            feedback={feedback}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            showPrevious={true}
            onPrevious={handlePrevious}
            isPreviousDisabled={currentQuestionIndex === 0}
            isNextDisabled={!feedback}
          />
        )
      )}
    </div>
  );
}
