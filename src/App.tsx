import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import BackButton from "@/components/BackButton";
import VintageBackground from "@/components/VintageBackground";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Searches from "./pages/Searches";
import PostSearch from "./pages/PostSearch";
import EditSearch from "./pages/EditSearch";
import SearchDetail from "./pages/SearchDetail";
import Messaging from "./pages/Messaging";
import MakeProposal from "./pages/MakeProposal";
import EditProposal from "./pages/EditProposal";
import MySpace from "./pages/MySpace";
import MyProposals from "./pages/MyProposals";
import PublicProfile from "./pages/PublicProfile";
import UserEvaluations from "./pages/UserEvaluations";
import Premium from "./pages/Premium";
import RequestReservation from "./pages/RequestReservation";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <VintageBackground />
          <BackButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/recherches" element={<Searches />} />
            <Route path="/recherche/:id" element={<SearchDetail />} />
            <Route path="/modifier-recherche/:id" element={<EditSearch />} />
            <Route path="/messagerie/:id" element={<Messaging />} />
            <Route path="/proposition/:id" element={<MakeProposal />} />
            <Route path="/modifier-proposition/:id" element={<EditProposal />} />
            <Route path="/mes-propositions" element={<MyProposals />} />
            <Route path="/poster" element={<PostSearch />} />
            <Route path="/mon-espace" element={<MySpace />} />
            <Route path="/profil/:userId" element={<PublicProfile />} />
            <Route path="/profil/:userId/evaluations" element={<UserEvaluations />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/reservation/:id" element={<RequestReservation />} />
            <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
