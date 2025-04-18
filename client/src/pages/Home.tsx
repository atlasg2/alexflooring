import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import ServicesOverview from "@/components/home/ServicesOverview";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

// Import AOS for scroll animations
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  useEffect(() => {
    // Set page title
    document.title = "APS Flooring - TEST VERSION 987654321";

    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 50,
    });

    // Refresh AOS when window is resized
    window.addEventListener('resize', AOS.refresh);

    return () => {
      window.removeEventListener('resize', AOS.refresh);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>APS Flooring LLC - Flooring That Speaks to Your Style</title>
        <meta name="description" content="We create spaces that feel uniquely yours. Expert flooring installation for homes and offices throughout Louisiana with hardwood, laminate, tile, and vinyl flooring options." />
        <meta name="keywords" content="flooring, hardwood, luxury vinyl, tile, flooring installation, New Orleans, Chalmette, Metairie, Louisiana, custom flooring" />
      </Helmet>

      <HeroSlider />
      <ServicesOverview />
      <FeaturedProjects />
      <Testimonials />
      <CTABanner />
    </>
  );
};

export default Home;