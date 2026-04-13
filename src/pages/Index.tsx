import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ActiveRequests from "@/components/ActiveRequests";
import SocialProofBar from "@/components/SocialProofBar";
import HowItWorks from "@/components/HowItWorks";
import BecomeFindr from "@/components/BecomeFindr";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import WaitlistSignup from "@/components/WaitlistSignup";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SocialProofBar />
      <ActiveRequests />
      <HowItWorks />
      <BecomeFindr />
      <Categories />
      <Testimonials />
      <WaitlistSignup />
      <Footer />
    </div>
  );
};

export default Index;
