import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ActiveRequests from "@/components/ActiveRequests";
import BecomeFindr from "@/components/BecomeFindr";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import WaitlistSignup from "@/components/WaitlistSignup";
import BuyrFindrSection from "@/components/BuyrFindrSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ActiveRequests />
      <HowItWorks />
      <BecomeFindr />
      <Categories />
      <Testimonials />
      <WaitlistSignup />
      <BuyrFindrSection />
      <Footer />
    </div>
  );
};

export default Index;
