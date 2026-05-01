import { useEffect, useState } from "react";
import Hero from "./Hero";
import HeroV2 from "./HeroV2";
import { getHeroVariant, trackAbViewOnce, type Variant } from "@/lib/abTest";

const HeroAbTest = () => {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    setVariant(getHeroVariant());
    trackAbViewOnce();
  }, []);

  // Évite un flash : rend B par défaut côté SSR/premier paint après hydratation
  if (!variant) return <HeroV2 />;
  return variant === "A" ? <Hero /> : <HeroV2 />;
};

export default HeroAbTest;
