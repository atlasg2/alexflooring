
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

const ServicesOverview = () => {
  // Array of all services for the grid with fixed images
  const allServices = [
    {
      id: "s1",
      title: "Hardwood Installation",
      description: "Premium solid hardwood floors with expert installation",
      icon: <Layers className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s2",
      title: "Luxury Vinyl Plank",
      description: "Waterproof, durable flooring for any room",
      icon: <Layers className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s3",
      title: "Carpet Installation",
      description: "Soft, comfortable carpeting for bedrooms and living areas",
      icon: <Grid className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s4",
      title: "Floor Refinishing",
      description: "Restore the beauty of your worn hardwood floors",
      icon: <Brush className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1594940856573-b461c07f95f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s5",
      title: "Tile Installation",
      description: "Beautiful tile for kitchens, bathrooms, and more",
      icon: <Grid className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s6",
      title: "Custom Showers",
      description: "Luxurious custom shower designs and installation",
      icon: <Grid className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s7",
      title: "Commercial Flooring",
      description: "Durable floors for high-traffic business environments",
      icon: <Building className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s8",
      title: "Epoxy Flooring",
      description: "Seamless, durable concrete coatings for garages & basements",
      icon: <Brush className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "s9",
      title: "Laminate Installation",
      description: "Affordable, versatile laminate flooring options",
      icon: <Layers className="h-10 w-10 text-secondary" />,
      image: "https://images.unsplash.com/photo-1584969902783-b8432d0e4117?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Get the commercial service
  const commercialService = commercialServices[0];

  return (
    <section id="services" className="relative">
      {/* Hero intro section with background image */}
      <div className="relative h-[500px] bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577401239170-897942555fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
                Expert Flooring Services
              </span>
            </h2>
            <div className="h-1 w-32 bg-secondary mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              Premium flooring solutions for residential and commercial spaces throughout Louisiana
            </p>
          </div>
        </div>
      </div>
      
      {/* Services Grid Layout */}
      <div className="bg-black py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {allServices.map((service, index) => (
              <div 
                key={service.id} 
                className="group relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-500 ease-in-out hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={100 + (index * 50)}
                data-aos-duration="800"
              >
                {/* Background Image with Overlay */}
                <div className="relative h-[300px] overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${service.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="mb-4 p-3 bg-black/40 backdrop-blur-sm rounded-full w-fit">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{service.description}</p>
                  <Link
                    href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center text-secondary hover:text-white text-sm font-medium transition-colors duration-300"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mb-20">
            <Link 
              href="/services"
              className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Completely redesigned commercial section */}
      <div className="bg-gradient-to-b from-black to-gray-900 py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Content */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-secondary/20 rounded-full">
                  <Building className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Commercial Flooring Solutions</h2>
              </div>
              
              <div className="h-1 w-24 bg-secondary mb-8"></div>
              
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                We provide high-performance flooring designed specifically for commercial environments. 
                Our solutions combine durability with aesthetics to create spaces that impress clients 
                while withstanding heavy foot traffic and daily wear.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                  <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">Minimal Business Disruption</h4>
                    <p className="text-white/70 text-sm">Flexible scheduling and efficient installation to keep your business running</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                  <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">ADA Compliance</h4>
                    <p className="text-white/70 text-sm">Solutions that meet accessibility requirements and safety standards</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                  <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">Professional Installation</h4>
                    <p className="text-white/70 text-sm">Expert installation teams with specific commercial flooring experience</p>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/services/commercial"
                className="inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                Explore Commercial Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            {/* Right side: Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Office Flooring" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg h-36">
                  <img 
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Retail Flooring" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-xl overflow-hidden shadow-lg h-36">
                  <img 
                    src="https://images.unsplash.com/photo-1600607687644-c7171b46426d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Healthcare Flooring" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1577401939270-df12522775ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Restaurant Flooring" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
