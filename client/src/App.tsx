import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import CampaignDetail from "@/pages/CampaignDetail";
import StartCampaign from "@/pages/StartCampaign";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import NgoDashboard from "@/pages/NgoDashboard";
import AdminPanel from "@/pages/AdminPanel";
import Support from "@/pages/Support";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/campaign/:id" component={CampaignDetail} />
      <Route path="/start-campaign" component={StartCampaign} />
      <Route path="/auth" component={Auth} />
      <Route path="/profile" component={Profile} />
      <Route path="/ngo-dashboard" component={NgoDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/support" component={Support} />
      <Route path="/how-it-works" component={Support} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Router />
          <MobileNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
