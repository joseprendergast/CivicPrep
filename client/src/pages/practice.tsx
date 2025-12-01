import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { QuestionOption } from "@shared/schema";
import QuestionCard from "@/components/question-card";
import ProgressIndicator from "@/components/progress-indicator";

interface PracticeProps {
  userToken: string | null;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  category: string;
  subcategory: string;
}

export default function Practice({ userToken }: PracticeProps) {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctOption: QuestionOption;
    selectedOption: QuestionOption;
    explanation: string;
  } | null>(null);
  const { toast } = useToast();

  // Start a practice session
  useEffect(() => {
    if (!userToken) return;

    setLoading(true);
    api.createTest(userToken, "practice")
      .then(data => {
        setTestId(data.testId);
        if (data.questions && data.questions.length > 0) {
          setCurrentQuestion(data.questions[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error starting practice session:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start practice session. Please try again.",
        });
        setLoading(false);
        navigate("/");
      });
  }, [userToken, navigate, toast]);

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || !testId || !userToken || feedback) return;
    
    // Set the selection first
    setSelectedOption(optionId);
    
    // Immediately submit the answer (single click behavior)
    api.submitAnswer(testId, userToken, currentQuestion.id, optionId)
      .then(response => {
        setFeedback(response);
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

  const handleNext = () => {
    // For practice mode, go back to home after each question
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Practice Mode</h2>
        </div>
        <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-100">
          <p className="text-primary font-medium">
            This mode prioritizes questions you've previously answered incorrectly to help you improve in areas you find challenging.
          </p>
        </div>
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
            showPrevious={false}
            onPrevious={() => {}}
            isPreviousDisabled={true}
            isNextDisabled={!feedback}
          />
        )
      )}
    </div>
  );
}
