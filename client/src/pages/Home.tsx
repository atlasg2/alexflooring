import { Helmet } from "react-helmet-async";
import HeroSlider from "@/components/home/HeroSlider";
import ServicesOverview from "@/components/home/ServicesOverview";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

const Home = () => {
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
      <WhyChooseUs />
      <Testimonials />
      <CTABanner />
    </>
  );
};

export default Home;
