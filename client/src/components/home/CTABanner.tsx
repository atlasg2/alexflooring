import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, ClipboardList } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0yNSAzMGgxMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPHBhdGggZD0iTTMwIDI1djEwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41Ii8+Cjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-primary/30 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Text and CTA side */}
          <div className="p-10 flex flex-col justify-center">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold font-montserrat text-white mb-6 leading-tight">
                Let's Create a Space That <span className="text-secondary">Reflects Your Style</span>
              </h2>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                Turn your flooring vision into a stunning reality. Get your free estimate today and transform your space with expert craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button 
                  asChild
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-50 py-5 px-8 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/80"
                >
                  <a href="tel:5044023895" className="flex items-center justify-center">
                    <Phone className="mr-3 h-5 w-5" /> (504) 402-3895
                  </a>
                </Button>
                <Button 
                  asChild
                  className="bg-secondary text-black hover:bg-secondary py-5 px-8 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-secondary"
                >
                  <Link href="/contact" className="flex items-center justify-center">
                    <ClipboardList className="mr-3 h-5 w-5" /> Schedule Estimate
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Image side */}
          <div className="hidden md:block relative h-full min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Modern interior with hardwood flooring" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
