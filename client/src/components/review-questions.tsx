import { CheckCircle } from "lucide-react";

interface ReviewQuestion {
  id: number;
  text: string;
  correctAnswer: string;
  attemptCount: number;
}

interface ReviewQuestionsProps {
  questions: ReviewQuestion[];
}

export default function ReviewQuestions({ questions }: ReviewQuestionsProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No questions to review yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <div 
          key={question.id} 
          className="border-l-4 border-red-500 bg-red-50 p-4 mb-3 rounded-r-md"
        >
          <h4 className="font-medium text-gray-700">{question.text}</h4>
          <p className="text-sm text-green-700 mt-1">
            <CheckCircle className="inline-block mr-1 h-4 w-4" /> 
            Correct answer: {question.correctAnswer}
          </p>
        </div>
      ))}
    </div>
  );
}
