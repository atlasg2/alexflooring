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
        <title>APS Flooring LLC - Transform Your Space with Beautiful Flooring</title>
        <meta name="description" content="Professional flooring services in Louisiana and Alabama. Hardwood, luxury vinyl, tile, and commercial flooring solutions with expert installation." />
        <meta name="keywords" content="flooring, hardwood, luxury vinyl, tile, flooring installation, Birmingham, New Orleans, Alabama, Louisiana" />
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
