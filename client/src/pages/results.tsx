import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TestResult } from "@shared/schema";
import { CheckCircle, XCircle, BookOpen, RotateCw } from "lucide-react";

interface ResultsProps {
  params: {
    testId: string;
  };
}

export default function Results({ params }: ResultsProps) {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const testId = parseInt(params.testId);
    if (isNaN(testId)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid test ID.",
      });
      navigate("/");
      return;
    }

    setLoading(true);
    api.getTestResults(testId)
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching test results:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load test results. Please try again.",
        });
        setLoading(false);
        navigate("/");
      });
  }, [params.testId, navigate, toast]);

  const handleReviewMissedQuestions = () => {
    navigate("/");
  };

  const handleStartNewTest = () => {
    navigate("/test");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Test Results Not Found</h2>
              <p className="mb-6">We couldn't find the results for this test.</p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Test Results</h2>
          
          <div className="flex justify-center mb-6">
            {results.passed ? (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 max-w-md">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="text-green-600 h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Congratulations!</h3>
                <p className="text-green-600 mb-1">You passed the test with a score of</p>
                <div className="text-4xl font-bold text-green-700 mb-3">
                  {results.score}/{results.totalQuestions}
                </div>
                <p className="text-sm text-green-600">You needed 6 correct answers to pass</p>
              </div>
            ) : (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 max-w-md">
                <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                  <XCircle className="text-red-600 h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold text-red-700 mb-2">You did not pass</h3>
                <p className="text-red-600 mb-1">You scored</p>
                <div className="text-4xl font-bold text-red-700 mb-3">
                  {results.score}/{results.totalQuestions}
                </div>
                <p className="text-sm text-red-600">You needed 6 correct answers to pass</p>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-primary mb-3">Question Summary</h3>
          <div className="space-y-3 mb-6">
            {results.questions.map((question) => (
              <div key={question.id} className="flex items-start p-3 border rounded-md">
                <div className="mr-3 mt-1">
                  {question.isCorrect ? (
                    <CheckCircle className="text-green-600 h-5 w-5" />
                  ) : (
                    <XCircle className="text-red-600 h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-700">{question.text}</p>
                  {question.selectedOption && (
                    <p className={`text-sm ${question.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                      Your answer: {question.selectedOption.text}
                    </p>
                  )}
                  {!question.isCorrect && question.correctOption && (
                    <p className="text-sm text-green-700">
                      Correct answer: {question.correctOption.text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1 border-primary text-primary hover:bg-blue-50"
              onClick={handleReviewMissedQuestions}
            >
              <BookOpen className="mr-2 h-4 w-4" /> Review Missed Questions
            </Button>
            <Button 
              variant="default"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleStartNewTest}
            >
              <RotateCw className="mr-2 h-4 w-4" /> Take Another Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
