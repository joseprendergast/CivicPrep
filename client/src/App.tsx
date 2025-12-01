import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

// Pages
import Home from "@/pages/home";
import Practice from "@/pages/practice";
import Test from "@/pages/test";
import Challenge from "@/pages/challenge";
import Results from "@/pages/results";
import NotFound from "@/pages/not-found";

// Layout
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Load or generate user token on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    
    if (storedToken) {
      setUserToken(storedToken);
    } else {
      fetch("/api/user/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem("userToken", data.userToken);
          setUserToken(data.userToken);
        })
        .catch(error => {
          console.error("Failed to generate user token:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to initialize application. Please refresh the page.",
          });
        });
    }
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={() => <Home userToken={userToken} />} />
          <Route path="/practice" component={() => <Practice userToken={userToken} />} />
          <Route path="/test" component={() => <Test userToken={userToken} />} />
          <Route path="/challenge" component={() => <Challenge userToken={userToken} />} />
          <Route path="/results/:testId" component={Results} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
