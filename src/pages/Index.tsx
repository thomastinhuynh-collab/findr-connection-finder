import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import BecomeFindr from "@/components/BecomeFindr";
import Categories from "@/components/Categories";
import TrustSection from "@/components/TrustSection";
import Testimonials from "@/components/Testimonials";
import WaitlistSignup from "@/components/WaitlistSignup";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <BecomeFindr />
      <Categories />
      <TrustSection />
      <Testimonials />
      <WaitlistSignup />
      <Footer />
    </div>
  );
};

export default Index;
