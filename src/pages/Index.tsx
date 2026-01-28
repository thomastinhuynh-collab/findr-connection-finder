import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import ProcessSteps from "@/components/ProcessSteps";
import Gamification from "@/components/Gamification";
import TrustSection from "@/components/TrustSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <SocialProof />
      <ProcessSteps />
      <Gamification />
      <TrustSection />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
