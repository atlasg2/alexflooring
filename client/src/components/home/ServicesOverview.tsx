import { Link } from "wouter";
import { services } from "@/data/services";
import { 
  Layers, Brush, Grid, Building, Fence, 
  ArrowRight 
} from "lucide-react";

// Map service icon names to Lucide icons
const iconComponents: Record<string, React.ReactNode> = {
  Fence: <Fence className="h-8 w-8 text-primary" />,
  Layers: <Layers className="h-8 w-8 text-primary" />,
  Brush: <Brush className="h-8 w-8 text-primary" />,
  Grid: <Grid className="h-8 w-8 text-primary" />,
  Building: <Building className="h-8 w-8 text-primary" />
};

const ServicesOverview = () => {
  return (
    <section id="services" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary">Our Services</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Professional flooring solutions tailored to your needs and style preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl"
            >
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${service.image})` }}
              ></div>
              <div className="p-6">
                <div className="w-16 h-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4 mx-auto">
                  {iconComponents[service.icon]}
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {service.shortDescription}
                </p>
                <Link 
                  href={`/services/${service.slug}`}
                  className="block text-center text-secondary font-medium hover:text-yellow-600 transition duration-300"
                >
                  Learn More <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
