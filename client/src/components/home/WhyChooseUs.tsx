import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Star, ThumbsUp, Shield } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary relative inline-block">
            Why Choose APS Flooring
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-8 md:p-10 shadow-xl border border-gray-100">
            <p className="text-xl text-gray-700 italic mb-8 leading-relaxed text-center">
              "Hey there! At APS Flooring, we're all about flooring that speaks to you. Imagine walking into a space 
              that feels uniquely yours—we make that happen. Our team pours passion and expertise into every floor 
              installation, treating your project like it's our own."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="flex gap-4 bg-gray-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-secondary flex-shrink-0">
                  <Heart className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Passion for Perfection</h3>
                  <p className="text-gray-600">
                    We pour passion and expertise into every floor installation, treating your project like it's our own.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 bg-gray-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-secondary flex-shrink-0">
                  <Star className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Versatile Solutions</h3>
                  <p className="text-gray-600">
                    From cozy homes to bustling offices, we've got you covered with top-notch hardwood, laminate, tile, or vinyl options.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 bg-gray-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-secondary flex-shrink-0">
                  <ThumbsUp className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Customer Satisfaction</h3>
                  <p className="text-gray-600">
                    We work closely with you to ensure your vision becomes a stunning reality that reflects your style and story.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 bg-gray-50 p-5 rounded-lg">
                <div className="p-3 rounded-full bg-secondary flex-shrink-0">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Quality Guarantee</h3>
                  <p className="text-gray-600">
                    We stand behind our work with professional installation and quality materials that last.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center font-medium">
              Let's turn your vision into a stunning reality together. Come join us in creating spaces that reflect your style and story!
            </p>

            <div className="text-center">
              <Button 
                asChild
                className="bg-primary text-white hover:bg-primary/80 py-4 px-10 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/contact">Get Your Free Estimate</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;