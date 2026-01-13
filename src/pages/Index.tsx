import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Categories from "@/components/Categories";
import FeaturedSearches from "@/components/FeaturedSearches";
import BecomeFindr from "@/components/BecomeFindr";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Categories />
      <FeaturedSearches />
      <BecomeFindr />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
