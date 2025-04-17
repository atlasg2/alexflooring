
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

// A simpler service card with large image focus
const ServiceItem = ({ service }: { service: typeof services[0] }) => (
  <div className="group relative h-96 overflow-hidden rounded-lg">
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      style={{ backgroundImage: `url(${service.image})` }}
    />
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
    
    {/* Icon */}
    <div className="absolute top-5 right-5 p-3 rounded-full bg-white/10 backdrop-blur-md">
      {iconComponents[service.icon]}
    </div>
    
    {/* Content */}
    <div className="absolute inset-x-0 bottom-0 p-6">
      <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
      <p className="text-white/80 text-sm line-clamp-2 mb-4">
        {service.shortDescription}
      </p>
      <Link
        href={`/services/${service.slug}`}
        className="inline-flex items-center bg-secondary text-black py-2 px-4 rounded text-sm font-medium transition-all duration-300 hover:bg-secondary/90"
      >
        Learn More <ArrowRight className="ml-1 h-4 w-4" />
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
