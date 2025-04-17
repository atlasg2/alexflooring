
import { Link } from "wouter";
import { services } from "@/data/services";
import { 
  Layers, Brush, Grid, Building, Fence, Wood,
  ArrowRight 
} from "lucide-react";

// Map service icon names to Lucide icons
const iconComponents: Record<string, React.ReactNode> = {
  Fence: <Fence className="h-10 w-10 text-secondary" />,
  Layers: <Layers className="h-10 w-10 text-secondary" />,
  Brush: <Brush className="h-10 w-10 text-secondary" />,
  Grid: <Grid className="h-10 w-10 text-secondary" />,
  Building: <Building className="h-10 w-10 text-secondary" />,
  Wood: <Wood className="h-10 w-10 text-secondary" />
};

const ServicesOverview = () => {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative inline-block">
            Our Services
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            Professional flooring solutions tailored to your needs and style preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service) => (
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
          ))}
        </div>

        <div className="text-center mt-16">
          <Link 
            href="/services"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            View All Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
