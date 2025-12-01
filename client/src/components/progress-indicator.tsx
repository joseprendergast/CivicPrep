interface ProgressIndicatorProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function ProgressIndicator({ currentQuestion, totalQuestions }: ProgressIndicatorProps) {
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
}
