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
    <section id="services" className="py-24 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
              Expert Flooring Services
            </span>
          </h2>
          <div className="h-1 w-24 bg-secondary mx-auto mt-4 mb-6"></div>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Premium flooring solutions for residential and commercial spaces throughout Louisiana
          </p>
        </div>
        
        {/* Residential services section */}
        <div className="mb-24 relative">
          {/* Background design elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 border-2 border-secondary/30 rounded-full opacity-20"></div>
          <div className="absolute top-1/3 -right-10 w-64 h-64 border-2 border-secondary/20 rounded-full opacity-10"></div>
          
          {/* Section header */}
          <div className="relative z-10 flex items-center mb-10 gap-4 backdrop-blur-sm">
            <div className="p-4 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg border border-secondary/30">
              <Home className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Residential Flooring</h2>
              <div className="h-1 w-20 bg-secondary"></div>
            </div>
          </div>
          
          <p className="text-white/70 max-w-3xl mb-12 text-lg">
            Transform your home with our premium residential flooring options. Choose from a wide variety of materials and styles to create a space that's uniquely yours.
          </p>
          
          {/* Service cards in a scrollable flex layout */}
          <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory hide-scrollbar">
            {residentialServices.map((service) => (
              <div key={service.id} className="flex-none w-full md:w-[500px] snap-center">
                <ServiceItem service={service} />
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Link 
              href="/services?category=residential"
              className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              View All Residential Services
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        
        {/* Commercial section with dark contrast */}
        <div className="pt-20 mt-20 relative border-t border-white/10">
          {/* Background design elements */}
          <div className="absolute top-0 right-0 w-48 h-48 border-2 border-secondary/20 rounded-full opacity-10"></div>
          <div className="absolute bottom-20 -left-20 w-72 h-72 border-2 border-secondary/10 rounded-full opacity-5"></div>
          
          {/* Section header */}
          <div className="relative z-10 flex items-center mb-10 gap-4">
            <div className="p-4 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg border border-secondary/30">
              <Store className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Commercial Flooring</h2>
              <div className="h-1 w-20 bg-secondary"></div>
            </div>
          </div>
          
          <p className="text-white/70 max-w-3xl mb-12 text-lg">
            Durable, high-performance flooring solutions for commercial spaces. We understand the unique needs of businesses and provide flooring that withstands high traffic while maintaining its appearance.
          </p>
          
          {/* Featured commercial service with enhanced visual appeal */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1 shadow-2xl overflow-hidden border border-white/10">
            <FeaturedService service={commercialService} />
          </div>
          
          <div className="mt-12 flex justify-center">
            <Link 
              href="/services?category=commercial"
              className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              View Commercial Services
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;