import { Helmet } from "react-helmet-async";
import { Link, useParams, useLocation } from "wouter";
import { services } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Phone, ClipboardList } from "lucide-react";
import CTABanner from "@/components/home/CTABanner";

const ServicePage = () => {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  
  const service = services.find(s => s.slug === slug);
  
  // If service not found, redirect to 404
  if (!service) {
    setLocation("/not-found");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`${service.title} - APS Flooring LLC`}</title>
        <meta name="description" content={service.metaDescription} />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative pt-20 pb-16 md:pb-24">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${service.image})` }}>
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{service.title}</h1>
            <p className="text-lg md:text-xl mb-8 text-white/80">{service.shortDescription}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-lg text-lg"
              >
                <a href="tel:5045551234" className="flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5" /> Call Us
                </a>
              </Button>
              <Button 
                asChild
                className="bg-secondary text-white hover:bg-yellow-500 py-3 px-8 rounded-lg text-lg"
              >
                <Link href="/contact" className="flex items-center justify-center">
                  <ClipboardList className="mr-2 h-5 w-5" /> Free Estimate
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
            <article className="prose lg:prose-xl">
              <div dangerouslySetInnerHTML={{ __html: service.fullDescription }} />
            </article>
            
            {/* Service Areas */}
            <div className="mt-16 p-6 bg-gray-100 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Service Areas</h3>
              <p className="text-gray-700">
                Now installing {service.title.toLowerCase()} in 
                <span className="font-medium"> New Orleans, Metairie, Chalmette, Birmingham, Hoover, Vestavia Hills</span>, 
                and surrounding areas throughout Louisiana and Alabama.
              </p>
            </div>
            
            {/* Related Services */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6">Explore Our Other Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services
                  .filter(s => s.slug !== slug)
                  .slice(0, 3)
                  .map(relatedService => (
                    <Link 
                      key={relatedService.id}
                      href={`/services/${relatedService.slug}`}
                      className="block bg-gray-100 p-6 rounded-lg hover:bg-gray-200 transition duration-300"
                    >
                      <h4 className="text-lg font-bold mb-2">{relatedService.title}</h4>
                      <p className="text-gray-600 text-sm">{relatedService.shortDescription}</p>
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
};

export default ServicePage;
