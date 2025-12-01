import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionOption } from "@shared/schema";
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Send } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: number;
    text: string;
    options: QuestionOption[];
  };
  selectedOption: string | null;
  feedback: {
    isCorrect: boolean;
    correctOption: QuestionOption;
    selectedOption: QuestionOption;
    explanation: string;
  } | null;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  showPrevious: boolean;
  onPrevious: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  isSubmitting?: boolean;
}

export default function QuestionCard({
  question,
  selectedOption,
  feedback,
  onSelectOption,
  onNext,
  showPrevious,
  onPrevious,
  isPreviousDisabled,
  isNextDisabled,
  isSubmitting = false,
}: QuestionCardProps) {
  // Initialize with null instead of selectedOption to ensure nothing is preselected
  const [tempSelectedOption, setTempSelectedOption] = useState<string | null>(null);
  
  // Reset tempSelectedOption when the question changes
  useEffect(() => {
    setTempSelectedOption(null);
  }, [question.id]);

  const handleOptionSelect = (optionId: string) => {
    if (feedback) return; // Don't allow changes after submission
    setTempSelectedOption(optionId);
    
    // If selected option is already set and we're in auto-submit mode,
    // directly call the submit function passed from the parent
    if (selectedOption !== null && !feedback) {
      onSelectOption(optionId);
    }
  };

  return (
    <Card className="mb-6 border-border dark:border-border/30 dark:bg-card/80">
      <CardContent className="p-4">
        <div className="flex flex-col max-h-full">
          {/* Question section */}
          <div className="flex-none mb-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-relaxed px-1">{question.text}</h3>
          </div>
          
          {/* Options section - compact layout */}
          <div className="flex-none mb-2">
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start p-3 mx-0.5 my-1 border rounded-md cursor-pointer transition-colors ${
                    tempSelectedOption === option.id
                      ? "bg-primary/10 border-primary text-foreground shadow-sm dark:bg-primary/25 dark:border-primary/80"
                      : "border-border hover:bg-primary/5 hover:border-primary/70 dark:border-border dark:hover:bg-primary/20"
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <input
                    type="radio"
                    name="answer"
                    className="mt-1 mr-3"
                    value={option.id}
                    checked={tempSelectedOption === option.id}
                    onChange={() => {}}
                    disabled={!!feedback}
                  />
                  <span className="text-base capitalize text-foreground">{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit button - direct submit with loading state */}
          {!feedback && tempSelectedOption && (
            <div className="mb-3 mt-1">
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground dark:text-white w-full"
                onClick={() => onSelectOption(tempSelectedOption)}
                disabled={!tempSelectedOption || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground dark:border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Answer
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Answer feedback - only show if feedback exists */}
          {feedback && (
            <div className="mb-3">
              {feedback.isCorrect ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-2 dark:bg-green-900/20 dark:text-green-50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="text-green-500 dark:text-green-400 h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-green-700 dark:text-green-300 font-medium">Correct!</p>
                      <p className="text-green-600 dark:text-green-300 text-sm line-clamp-2">{feedback.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-l-4 border-red-500 p-2 dark:bg-red-900/20 dark:text-red-50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="text-red-500 dark:text-red-400 h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-red-700 dark:text-red-300 font-medium">Incorrect</p>
                      <p className="text-red-600 dark:text-red-300 text-sm line-clamp-2">
                        The correct answer is: <span className="font-medium capitalize">{feedback.correctOption.text}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between pt-1 border-t border-border dark:border-border/30 mt-1">
            {showPrevious ? (
              <Button
                variant="ghost"
                className="text-primary dark:text-primary-foreground font-medium disabled:text-gray-400 dark:disabled:text-gray-600"
                onClick={onPrevious}
                disabled={isPreviousDisabled}
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
            ) : (
              <div></div>
            )}
            
            {feedback && (
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground dark:text-white dark:hover:bg-primary/80"
                onClick={onNext}
              >
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
