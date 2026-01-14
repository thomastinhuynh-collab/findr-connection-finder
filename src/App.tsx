import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Searches from "./pages/Searches";
import PostSearch from "./pages/PostSearch";
import SearchDetail from "./pages/SearchDetail";
import Messaging from "./pages/Messaging";
import MakeProposal from "./pages/MakeProposal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/recherches" element={<Searches />} />
          <Route path="/recherche/:id" element={<SearchDetail />} />
          <Route path="/messagerie/:id" element={<Messaging />} />
          <Route path="/proposition/:id" element={<MakeProposal />} />
          <Route path="/poster" element={<PostSearch />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
