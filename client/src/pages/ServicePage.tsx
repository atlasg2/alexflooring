import { Helmet } from "react-helmet-async";
import { Link, useParams, useLocation } from "wouter";
import { services } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Phone, ClipboardList, CheckCircle, ArrowRight, MapPin, Clock, Sparkles } from "lucide-react";
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

  // Get residential services for related section
  const relatedServices = services
    .filter(s => s.category === 'residential' && s.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{`${service.title} - APS Flooring LLC`}</title>
        <meta name="description" content={service.metaDescription} />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative min-h-[70vh] flex items-center mt-16">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/20 backdrop-blur-sm border border-secondary/30 mb-6">
              <span className="text-secondary font-semibold">Professional Installation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-sm">
              {service.title}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl leading-relaxed">
              {service.shortDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 rounded-xl text-lg shadow-lg hover:shadow-xl transition duration-300"
              >
                <a href="tel:5044023895" className="flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" /> (504) 402-3895
                </a>
              </Button>
              <Button 
                asChild
                size="lg"
                className="bg-secondary text-black hover:bg-secondary/90 rounded-xl text-lg shadow-lg hover:shadow-xl transition duration-300"
              >
                <Link href="/contact" className="flex items-center justify-center gap-2">
                  <ClipboardList className="h-5 w-5" /> Free Estimate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Features Section */}
      {service.features && (
        <section className="py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Choose Our {service.title}?</h2>
                  <p className="text-white/80 text-lg mb-8">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-4">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                        <span className="text-white/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {service.beforeImage && service.afterImage && (
                  <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-secondary/10 transform md:translate-y-4">
                    <div className="relative h-[350px] w-full overflow-hidden group">
                      <img
                        src={service.afterImage}
                        alt={`${service.title} - After`}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-10 group-hover:opacity-0"
                      />
                      <img
                        src={service.beforeImage}
                        alt={`${service.title} - Before`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-1000 opacity-0 group-hover:opacity-100">
                        <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                          <Sparkles className="inline-block h-5 w-5 mr-2 text-secondary" />
                          <span>Before &amp; After</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-y-6 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">{service.title} Services</h2>
              <div className="h-1 w-24 bg-secondary"></div>
            </div>
            
            <article className="prose lg:prose-xl max-w-none">
              <div dangerouslySetInnerHTML={{ __html: service.fullDescription }} />
            </article>
            
            {/* Extra Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
              {/* Service Areas */}
              <div className="p-8 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-secondary mr-3" />
                  <h3 className="text-xl font-bold text-primary">Service Areas</h3>
                </div>
                <p className="text-gray-700">
                  We install {service.title.toLowerCase()} in <span className="font-medium">New Orleans, Metairie, Chalmette, Birmingham, Hoover, Vestavia Hills</span>, and surrounding areas throughout Louisiana and Alabama.
                </p>
              </div>
              
              {/* Quick Process */}
              <div className="p-8 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-secondary mr-3" />
                  <h3 className="text-xl font-bold text-primary">Our Process</h3>
                </div>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex items-baseline gap-2">
                    <span className="bg-secondary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">1</span>
                    <span>Free in-home consultation and estimate</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="bg-secondary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">2</span>
                    <span>Material selection and project planning</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="bg-secondary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">3</span>
                    <span>Professional installation by our expert team</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="bg-secondary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">4</span>
                    <span>Final inspection and customer satisfaction review</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
            
      {/* Related Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Explore Our Other Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our full range of professional flooring solutions for your home or business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedServices.map(relatedService => (
                <Link 
                  key={relatedService.id}
                  href={`/services/${relatedService.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:translate-y-[-4px] h-full flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={relatedService.image} 
                        alt={relatedService.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-primary mb-2">{relatedService.title}</h3>
                      <p className="text-gray-600 mb-4 flex-grow">{relatedService.shortDescription}</p>
                      <div className="flex items-center text-secondary font-medium">
                        Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/services">
                  View All Our Services <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <CTABanner />
    </>
  );
};

export default ServicePage;
