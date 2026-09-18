import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

import VintageBackground from "@/components/VintageBackground";
import ScrollToTop from "@/components/ScrollToTop";
import BackButton from "./components/BackButton";
import Navbar from "./components/Navbar";

const Index = lazy(() => import("./pages/Index"));
const Searches = lazy(() => import("./pages/Searches"));
const PostSearch = lazy(() => import("./pages/PostSearch"));
const EditSearch = lazy(() => import("./pages/EditSearch"));
const SearchDetail = lazy(() => import("./pages/SearchDetail"));
const Messaging = lazy(() => import("./pages/Messaging"));
const MakeProposal = lazy(() => import("./pages/MakeProposal"));
const EditProposal = lazy(() => import("./pages/EditProposal"));
const MySpace = lazy(() => import("./pages/MySpace"));
const MyProposals = lazy(() => import("./pages/MyProposals"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const UserEvaluations = lazy(() => import("./pages/UserEvaluations"));
const Premium = lazy(() => import("./pages/Premium"));
const RequestReservation = lazy(() => import("./pages/RequestReservation"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminDisputes = lazy(() => import("./pages/AdminDisputes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Chargement" />
  </div>
);

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

          <Suspense fallback={<PageFallback />}>
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
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/admin/litiges" element={<AdminDisputes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
