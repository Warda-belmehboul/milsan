import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Dictionary from "@/pages/dictionary";
import Tafseeh from "@/pages/tafseeh";
import Proofreaders from "@/pages/proofreaders";
import Rhymes from "@/pages/rhymes";
import Courses from "@/pages/courses";
import Community from "@/pages/community";
import Quiz from "@/pages/quiz";
import Spelling from "@/pages/spelling";
import Admin from "@/pages/admin";
import Join from "@/pages/join";
import ProofreaderDashboard from "@/pages/proofreader-dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dictionary" component={Dictionary} />
      <Route path="/tafseeh" component={Tafseeh} />
      <Route path="/proofreaders" component={Proofreaders} />
      <Route path="/rhymes" component={Rhymes} />
      <Route path="/courses" component={Courses} />
      <Route path="/community" component={Community} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/spelling" component={Spelling} />
      <Route path="/admin" component={Admin} />
      <Route path="/join" component={Join} />
      <Route path="/proofreader-dashboard" component={ProofreaderDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
