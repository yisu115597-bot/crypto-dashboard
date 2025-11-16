import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ApiKeys from "./pages/ApiKeys";
import Wallets from "./pages/Wallets";
import Settings from "./pages/Settings";
import UserSettings from "./pages/UserSettings";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/api-keys"} component={ApiKeys} />
      <Route path={"/wallets"} component={Wallets} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/user/:username/settings"} component={UserSettings} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
