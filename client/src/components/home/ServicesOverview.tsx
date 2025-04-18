import { Link } from "wouter";
import { services } from "@/data/services";
import { 
  Layers, Brush, Grid, Building, Fence, 
  ArrowRight, Hammer, Home, Store, Check
} from "lucide-react";

// Map service icon names to Lucide icons
const iconComponents: Record<string, React.ReactNode> = {
  Fence: <Fence className="h-8 w-8 text-secondary" />,
  Layers: <Layers className="h-8 w-8 text-secondary" />,
  Brush: <Brush className="h-8 w-8 text-secondary" />,
  Grid: <Grid className="h-8 w-8 text-secondary" />,
  Building: <Building className="h-8 w-8 text-secondary" />,
  Hammer: <Hammer className="h-8 w-8 text-secondary" />
};

// Filter services by category
const residentialServices = services.filter(service => service.category === 'residential');
const commercialServices = services.filter(service => service.category === 'commercial');

// Enhanced service card with large image focus and better hover effects
const ServiceItem = ({ service }: { service: typeof services[0] }) => (
  <div className="group relative h-[400px] overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500">
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
      style={{ backgroundImage: `url(${service.image})` }}
    />
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500" />
    
    {/* Animated Icon */}
    <div className="absolute top-6 right-6 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transform transition-all duration-500 group-hover:scale-110 shadow-lg">
      {iconComponents[service.icon]}
    </div>
    
    {/* Content with slide-up animation */}
    <div className="absolute inset-x-0 bottom-0 p-8 transform transition-all duration-500 ease-in-out group-hover:translate-y-[-8px]">
      <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-md">{service.title}</h3>
      <p className="text-white/90 text-base line-clamp-2 mb-5 max-w-md leading-relaxed">
        {service.shortDescription}
      </p>
      <Link
        href={`/services/${service.slug}`}
        className="inline-flex items-center bg-secondary text-black py-2.5 px-5 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-secondary transform hover:-translate-y-1 shadow-md hover:shadow-lg"
      >
        Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  </div>
);

// Featured service with details (used for commercial)
const FeaturedService = ({ service }: { service: typeof services[0] }) => (
  <div className="relative overflow-hidden rounded-lg bg-black">
    <div className="grid grid-cols-1 md:grid-cols-3">
      {/* Large Image - Takes 2/3 of the width on desktop */}
      <div className="relative col-span-2 h-96 md:h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${service.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
      </div>
      
      {/* Content - Takes 1/3 of the width on desktop */}
      <div className="p-8 md:p-10 flex flex-col justify-center bg-black text-white">
        <div className="mb-6 inline-flex items-center">
          <div className="p-3 rounded-full bg-secondary/20 mr-4">
            {iconComponents[service.icon]}
          </div>
          <h3 className="text-2xl font-bold">{service.title}</h3>
        </div>
        
        <p className="text-white/80 mb-8">
          {service.shortDescription}
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-secondary mt-0.5" />
            <span>Minimal business disruption with flexible scheduling</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-secondary mt-0.5" />
            <span>ADA compliance and safety considerations</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-secondary mt-0.5" />
            <span>Professional installation for maximum durability</span>
          </div>
        </div>
        
        <Link 
          href={`/services/${service.slug}`}
          className="inline-flex items-center bg-secondary text-black py-3 px-6 rounded text-sm font-medium transition-all duration-300 hover:bg-secondary/90"
        >
          Learn More <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  </div>
);

const ServicesOverview = () => {
  // Get the commercial service - there should be just one
  const commercialService = commercialServices[0];

  return (
    <section id="services" className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary relative inline-block">
            Our Services
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            Professional flooring solutions tailored to your needs and style preferences.
          </p>
        </div>
        
        {/* Residential section with heading */}
        <div className="mb-20">
          <div className="flex items-center mb-6 gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-primary relative">
              Residential
              <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
            </h2>
          </div>
          
          <p className="text-gray-600 max-w-3xl mb-10">
            Transform your home with our premium residential flooring solutions, from hardwood to luxury vinyl and custom tile installations.
          </p>
          
          {/* Grid of service cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {residentialServices.map((service) => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
          
          <div className="mt-10 flex justify-center">
            <Link 
              href="/services?category=residential"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              View All Residential Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* Commercial section with heading */}
        <div className="pt-10 mt-20 border-t border-gray-200">
          <div className="flex items-center mb-6 gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-primary relative">
              Commercial
              <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
            </h2>
          </div>
          
          <p className="text-gray-600 max-w-3xl mb-10">
            Durable, attractive flooring solutions designed for businesses, offices, restaurants, and commercial spaces that withstand high traffic.
          </p>
          
          {/* Featured commercial service */}
          <FeaturedService service={commercialService} />
          
          <div className="mt-10 flex justify-center">
            <Link 
              href="/services?category=commercial"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              View Commercial Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;