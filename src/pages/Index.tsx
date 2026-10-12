// ============= Full file contents =============

import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ActiveRequests from "@/components/ActiveRequests";
import ExpiringSoon from "@/components/ExpiringSoon";
import BecomeFindr from "@/components/BecomeFindr";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { useWaitlistConfirmationNotice } from "@/hooks/useWaitlist";

const Index = () => {
  // Alerte affichée quand on revient sur l'accueil après avoir confirmé son inscription
  useWaitlistConfirmationNotice();

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ExpiringSoon />
      <ActiveRequests />
      <HowItWorks />
      <BecomeFindr />
      <Categories />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
