
import { Link } from "wouter";
import { services } from "@/data/services";
import { 
  Layers, Brush, Grid, Building, Fence, 
  ArrowRight, Hammer, Home, Store
} from "lucide-react";

// Map service icon names to Lucide icons
const iconComponents: Record<string, React.ReactNode> = {
  Fence: <Fence className="h-10 w-10 text-secondary" />,
  Layers: <Layers className="h-10 w-10 text-secondary" />,
  Brush: <Brush className="h-10 w-10 text-secondary" />,
  Grid: <Grid className="h-10 w-10 text-secondary" />,
  Building: <Building className="h-10 w-10 text-secondary" />,
  Hammer: <Hammer className="h-10 w-10 text-secondary" />
};

// Filter services by category
const residentialServices = services.filter(service => service.category === 'residential');
const commercialServices = services.filter(service => service.category === 'commercial');

// For residential, we want to show all services
// For commercial, we just show the commercial flooring service

const ServiceCard = ({ service }: { service: typeof services[0] }) => (
  <div 
    key={service.id}
    className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group border border-gray-100"
  >
    <div 
      className="h-56 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${service.image})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-xl font-bold text-white">
          {service.title}
        </h3>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
          {iconComponents[service.icon]}
        </div>
        <div>
          <p className="text-gray-600">
            {service.shortDescription}
          </p>
        </div>
      </div>
      <Link 
        href={`/services/${service.slug}`}
        className="inline-flex items-center mt-2 text-secondary font-medium hover:text-primary transition-colors duration-300 group-hover:underline"
      >
        Learn More <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  </div>
);

// Residential services layout - grid of all services
const ResidentialServices = ({ 
  services,
  icon, 
  bgColor = "bg-white"
}: { 
  services: typeof import("@/data/services").services; 
  icon: React.ReactNode;
  bgColor?: string;
}) => (
  <div className={`py-16 ${bgColor}`}>
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-center mb-10 gap-4">
        <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative">
          Residential
          <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
        </h2>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
        Transform your home with our premium residential flooring solutions, from hardwood to luxury vinyl and custom tile installations.
      </p>

      {/* Grid layout showing all residential services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <div className="text-center mt-10">
        <Link 
          href="/services?category=residential"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          View All Residential Services
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  </div>
);

// Commercial services layout - single service with more details
const CommercialServices = ({ 
  service,
  icon, 
  bgColor = "bg-white"
}: { 
  service: typeof import("@/data/services").services[0]; 
  icon: React.ReactNode;
  bgColor?: string;
}) => (
  <div className={`py-16 ${bgColor}`}>
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-center mb-10 gap-4">
        <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative">
          Commercial
          <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
        </h2>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
        Durable, attractive flooring solutions designed for businesses, offices, restaurants, and commercial spaces that withstand high traffic.
      </p>

      {/* Featured commercial service in a horizontal layout */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-100 mb-12">
        <div className="grid md:grid-cols-2 gap-0">
          <div 
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${service.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white">
                {service.title}
              </h3>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-6">
              <div className="p-4 rounded-full bg-primary/10 inline-flex items-center justify-center mb-4">
                {iconComponents[service.icon]}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
              <p className="text-gray-600">
                {service.shortDescription}
              </p>
              <div className="mt-6">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>Minimal business disruption with flexible scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>ADA compliance and safety considerations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>Professional installation for maximum durability</span>
                  </li>
                </ul>
              </div>
            </div>
            <Link 
              href={`/services/${service.slug}`}
              className="inline-flex items-center mt-2 text-secondary font-medium hover:text-primary transition-colors duration-300 hover:underline"
            >
              Learn More About Commercial Flooring <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link 
          href="/services?category=commercial"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          View Commercial Services
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  </div>
);

const ServicesOverview = () => {
  // Get the commercial service - there should be just one
  const commercialService = commercialServices[0];

  return (
    <section id="services">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative inline-block">
            Our Services
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            Professional flooring solutions tailored to your needs and style preferences.
          </p>
        </div>
      </div>
      
      {/* Residential services with grid layout */}
      <ResidentialServices 
        services={residentialServices}
        icon={<Home className="h-10 w-10 text-secondary" />}
        bgColor="bg-gray-50"
      />
      
      {/* Commercial services with horizontal layout */}
      <CommercialServices 
        service={commercialService}
        icon={<Store className="h-10 w-10 text-secondary" />}
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 text-center">
        <Link 
          href="/services"
          className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg text-lg"
        >
          View All Services
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
};

export default ServicesOverview;
