import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import StatsDisplay from "@/components/stats-display";
import ReviewQuestions from "@/components/review-questions";
import { UserStats } from "@shared/schema";
import { ClipboardCheck, BookOpen, Award } from "lucide-react";

interface HomeProps {
  userToken: string | null;
}

export default function Home({ userToken }: HomeProps) {
  const [, navigate] = useLocation();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userToken) {
      setLoading(false);
      return;
    }

    // Fetch user stats
    fetch(`/api/user/${userToken}/stats`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch stats: ${res.statusText}`);
        }
        return res.json();
      })
      .then(stats => {
        setUserStats(stats);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your progress.",
        });
        setLoading(false);
      });
  }, [userToken, toast]);

  const startPractice = () => {
    if (!userToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please wait for the application to initialize.",
      });
      return;
    }
    navigate("/practice");
  };

  const startTest = () => {
    if (!userToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please wait for the application to initialize.",
      });
      return;
    }
    navigate("/test");
  };
  
  const startChallenge = () => {
    if (!userToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please wait for the application to initialize.",
      });
      return;
    }
    navigate("/challenge");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Welcome to the USCIS Civics Test Simulator</h2>
          <p className="text-muted-foreground mb-3">
            This application will help you prepare for the civics portion of the U.S. naturalization test. 
            The actual test consists of 10 questions from a pool of 100. You must answer 6 correctly to pass.
          </p>
          <p className="text-muted-foreground mb-6">
            <strong>Adaptive Learning:</strong> Our practice mode smartly focuses on questions you've answered incorrectly, 
            helping you improve in areas where you need it most.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-primary mb-2">Your Progress</h3>
            
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <StatsDisplay stats={userStats} />
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Choose a Study Mode:</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Challenge Card - Highlighted */}
              <div className="relative overflow-hidden border-2 border-amber-500 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 shadow-md">
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm font-bold">
                  NEW!
                </div>
                <div className="p-5">
                  <div className="flex items-start">
                    <div className="bg-amber-500 rounded-full p-2 mr-4">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-amber-800">100 Questions Challenge</h4>
                      <p className="text-amber-700 mb-3">Master all 100 official USCIS questions through a series of 10 tests. Track your progress and identify weak areas.</p>
                      <Button 
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={startChallenge}
                      >
                        Start Challenge
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Regular study modes in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Practice Mode */}
                <div className="border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-primary rounded-full p-2 mr-3">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-primary">Adaptive Practice</h4>
                      <p className="text-sm text-slate-600 mb-3">Practice one question at a time with our adaptive system that focuses on questions you struggle with.</p>
                      <Button 
                        variant="default" 
                        className="bg-primary hover:bg-primary/90 w-full" 
                        onClick={startPractice}
                      >
                        Start Practice
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Test Simulation */}
                <div className="border rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-red-600 rounded-full p-2 mr-3">
                      <ClipboardCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-red-700">Test Simulation</h4>
                      <p className="text-sm text-slate-600 mb-3">Take a full 10-question test simulation just like the real USCIS interview. You need 6 correct to pass.</p>
                      <Button 
                        variant="destructive" 
                        className="bg-red-600 hover:bg-red-700 w-full" 
                        onClick={startTest}
                      >
                        Start Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {userStats && userStats.missedQuestions.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-primary mb-4">Questions You Need to Review</h3>
            <ReviewQuestions questions={userStats.missedQuestions.slice(0, 3)} />
            
            {userStats.missedQuestions.length > 3 && (
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80 font-medium mt-2 p-0"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Full review mode will be available in a future update."
                })}
              >
                View all questions to review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
