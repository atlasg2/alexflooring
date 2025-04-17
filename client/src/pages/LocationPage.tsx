import { Helmet } from "react-helmet-async";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import CTABanner from "@/components/home/CTABanner";
import { locations } from "@/data/locations";
import MapEmbed from "@/components/ui/map-embed";

type LocationParams = {
  city: string;
};

const LocationPage = ({ city }: LocationParams) => {
  const [, setLocation] = useLocation();
  
  // Find the location data based on the city param
  const location = locations.find(loc => 
    loc.slug === city || loc.slug === city.toLowerCase()
  );
  
  // If location not found, redirect to 404
  if (!location) {
    setLocation("/not-found");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`${location.name} Flooring Services - APS Flooring LLC`}</title>
        <meta name="description" content={`Professional flooring installation in ${location.name}. Hardwood, luxury vinyl, tile and more. Serving ${location.areas.join(", ")} and surrounding areas.`} />
        <meta name="keywords" content={`flooring ${location.name}, hardwood floors ${location.name}, vinyl flooring ${location.name}, tile installation ${location.name}, ${location.areas.join(", ")}`} />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url(${location.image})` }}
        >
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Professional Flooring Services in {location.name}
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Expert installation of hardwood, luxury vinyl, tile, and more throughout {location.state}.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-white/90 mb-8">
              <MapPin className="h-5 w-5 text-secondary" />
              <span>Serving {location.areas.join(", ")}, and surrounding areas</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-lg text-lg"
              >
                <a href={`tel:${location.phone}`} className="flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5" /> {location.phoneDisplay}
                </a>
              </Button>
              <Button 
                asChild
                className="bg-secondary text-white hover:bg-yellow-500 py-3 px-8 rounded-lg text-lg"
              >
                <Link href="/contact" className="flex items-center justify-center">
                  Get a Free Estimate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Quality Flooring Solutions in {location.name}
            </h2>
            
            <div className="prose lg:prose-xl mb-12">
              <p>
                APS Flooring LLC is proud to serve {location.name} and the surrounding 
                {location.state === "Alabama" ? " Alabama" : " Louisiana"} communities with exceptional flooring 
                installation and refinishing services. As a locally owned and operated business, 
                we understand the unique needs and preferences of {location.name} homeowners.
              </p>
              
              <p>
                Our team of experienced flooring professionals is dedicated to providing 
                top-quality craftsmanship and customer service. From classic hardwood to 
                modern luxury vinyl and custom tile work, we offer comprehensive flooring solutions 
                for homes and businesses throughout the {location.name} area.
              </p>
              
              <h3>Our Services in {location.name}</h3>
              <ul>
                <li><strong>Hardwood Flooring:</strong> Installation, refinishing, and restoration</li>
                <li><strong>Luxury Vinyl Plank:</strong> Waterproof, durable flooring for any room</li>
                <li><strong>Tile Installation:</strong> Custom tile for floors, showers, and backsplashes</li>
                <li><strong>Floor Refinishing:</strong> Breathe new life into existing hardwood</li>
                <li><strong>Commercial Flooring:</strong> Durable solutions for businesses</li>
              </ul>
              
              <p>
                We pride ourselves on our attention to detail, use of quality materials, and commitment 
                to customer satisfaction. When you choose APS Flooring for your {location.name} home or 
                business, you're partnering with flooring experts who care about delivering exceptional results.
              </p>
            </div>
            
            <div id="areas" className="bg-gray-100 p-8 rounded-lg mb-12">
              <h3 className="text-2xl font-bold text-primary mb-4">Areas We Serve in {location.state}</h3>
              <p className="mb-6">
                Our {location.name}-based team provides flooring services throughout the region, including:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {location.areas.map((area, index) => (
                  <div key={index} className="flex items-center">
                    <MapPin className="h-4 w-4 text-secondary mr-2" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Local Testimonials */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-primary mb-6">What {location.name} Customers Say</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {location.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-gray-100 p-6 rounded-lg">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-secondary fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="italic text-gray-700 mb-4">"{testimonial.quote}"</blockquote>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.neighborhood}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-primary mb-6">Visit Us in {location.name}</h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapEmbed 
                  address={`${location.address}, ${location.name}, ${location.state}`}
                  city={location.name}
                />
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between bg-gray-100 p-4 rounded-lg">
                <div className="flex items-start mb-4 md:mb-0">
                  <MapPin className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0" />
                  <span>{location.address}, {location.name}, {location.state}</span>
                </div>
                <Button 
                  asChild
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(`${location.address}, ${location.name}, ${location.state}`)}`} target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
};

export default LocationPage;
