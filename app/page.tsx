import AuthEmailCallbackAlert from "./components/AuthEmailCallbackAlert";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import FeatureHighlights from "./components/FeatureHighlights";
import FeaturesGrid from "./components/FeaturesGrid";
import HowItWorks from "./components/HowItWorks";
import CTABand from "./components/CTABand";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <AuthEmailCallbackAlert />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <FeatureHighlights />
        <FeaturesGrid />
        <HowItWorks />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
