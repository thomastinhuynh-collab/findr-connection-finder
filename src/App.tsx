import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

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
import ResetPassword from "./pages/ResetPassword";
import LegalNotice from "./pages/LegalNotice";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import AdminDisputes from "./pages/AdminDisputes";
import NotFound from "./pages/NotFound";
import BackButton from "./components/BackButton";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <BackButton />
          <VintageBackground />
          
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/cgu" element={<Terms />} />
            <Route path="/confidentialite" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/litiges" element={<AdminDisputes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
