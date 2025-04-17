import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, ClipboardList } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white mb-4">
              Let's Create a Space That Reflects Your Style
            </h2>
            <p className="text-xl text-white/90">
              Turn your flooring vision into a stunning reality. Get your free estimate today!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <a href="tel:5044023895" className="flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5" /> (504) 402-3895
              </a>
            </Button>
            <Button 
              asChild
              className="bg-secondary text-white hover:bg-secondary/80 py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href="/contact" className="flex items-center justify-center">
                <ClipboardList className="mr-2 h-5 w-5" /> Schedule Estimate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
