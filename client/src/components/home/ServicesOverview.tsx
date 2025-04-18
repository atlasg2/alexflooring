import React from "react";
import { Link } from "wouter";
import { 
  Layers, Brush, Grid,
  ArrowRight, Hammer
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Map service icon names to Lucide icons
const iconComponents: Record<string, React.ReactNode> = {
  Layers: <Layers className="h-6 w-6 text-white" />,
  Brush: <Brush className="h-6 w-6 text-white" />,
  Grid: <Grid className="h-6 w-6 text-white" />,
  Hammer: <Hammer className="h-6 w-6 text-white" />
};

// Exactly 6 residential services with updated images
const residentialServices = [
  {
    title: "Hardwood Flooring",
    description: "Premium oak, maple, and walnut flooring for timeless beauty and durability.",
    image: "https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "hardwood",
    icon: "Layers"
  },
  {
    title: "Luxury Vinyl Plank",
    description: "Waterproof, durable flooring that looks like real wood but offers superior performance.",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "lvp",
    icon: "Layers"
  },
  {
    title: "Floor Refinishing",
    description: "Restore your worn hardwood floors to like-new condition with professional refinishing.",
    image: "https://images.unsplash.com/photo-1595770655257-08afd8487979?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    slug: "refinishing",
    icon: "Brush"
  },
  {
    title: "Tile Flooring",
    description: "Durable, beautiful tile for kitchens, bathrooms, and living spaces.",
    image: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "tile",
    icon: "Grid"
  },
  {
    title: "Custom Showers",
    description: "Transform your bathroom with a stunning custom tile shower installation.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "tile",
    icon: "Grid"
  },
  {
    title: "Carpet",
    description: "Soft, comfortable carpet options for bedrooms and living areas.",
    image: "https://images.unsplash.com/photo-1536330294201-1cc650c8d263?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "carpet",
    icon: "Layers"
  }
];

// Simple section component
const SectionHeader = ({ title }: { title: string }) => (
  <div className="text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
        {title}
      </span>
    </h2>
    <div className="h-1 w-32 bg-secondary mx-auto mb-8"></div>
  </div>
);

const ServicesOverview = () => {
  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-4">
        {/* About Us Section with background image */}
        <div className="mb-24 relative">
          {/* Background image */}
          <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1595683363301-1e94594a550d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)` }}></div>
          
          {/* Content overlay */}
          <div className="relative z-10 py-20 px-4 flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
                  About APS Flooring
                </span>
              </h2>
              <div className="h-1 w-32 bg-secondary mx-auto mb-8"></div>
            </div>
            
            <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <p className="text-xl text-white mb-4 leading-relaxed">
                APS Flooring is Louisiana's premier flooring specialist, delivering exceptional craftsmanship and personalized service. Our expert team is committed to transforming your spaces with premium materials and attention to detail.
              </p>
              <p className="text-xl text-white leading-relaxed">
                With a reputation for quality and customer satisfaction, we pride ourselves on bringing your vision to life with beautiful, durable flooring solutions.
              </p>
            </div>
          </div>
        </div>
        
        {/* Residential Services */}
        <div className="mb-24">
          <SectionHeader title="Our Services" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {residentialServices.map((service, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-lg h-64 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${service.image})` }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90" />
                
                {/* Icon */}
                <div className="absolute top-4 left-4 p-3 rounded-full bg-secondary/80 backdrop-blur-sm">
                  {iconComponents[service.icon]}
                </div>
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <Link href={`/services/${service.slug}`}>
                    <button className="text-secondary hover:text-white text-sm font-semibold transition-colors duration-300 flex items-center">
                      Learn More <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/services">
              <Button className="bg-secondary text-black hover:bg-secondary/90 px-6 py-3 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;