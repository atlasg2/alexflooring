import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Star, ThumbsUp, Shield } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
        {/* Background design elements */}
        <div className="absolute top-10 -right-20 w-80 h-80 border-2 border-secondary/10 rounded-full opacity-10"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 border-2 border-secondary/20 rounded-full opacity-5"></div>
      
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
              Why Choose APS Flooring
            </span>
          </h2>
          <div className="h-1 w-24 bg-secondary mx-auto mt-4 mb-6"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Quote section with stylish border */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1 shadow-2xl mb-16 border border-white/10 overflow-hidden">
            <div className="bg-gradient-to-br from-black/60 to-black/90 p-10 md:p-12 rounded-xl backdrop-blur-sm">
              <div className="text-5xl text-secondary opacity-30 font-serif mb-4">"</div>
              <p className="text-xl md:text-2xl text-white/90 italic mb-8 leading-relaxed text-center font-light">
                At APS Flooring, we're all about flooring that speaks to you. Imagine walking into a space 
                that feels uniquely yours—we make that happen. Our team pours passion and expertise into every floor 
                installation, treating your project like it's our own.
              </p>
              <div className="text-5xl text-secondary opacity-30 font-serif text-right">"</div>
            </div>
          </div>

          {/* Benefits grid with improved styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="group bg-white/5 rounded-2xl p-0.5 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-secondary/30 overflow-hidden">
              <div className="bg-gradient-to-br from-black/80 to-black/90 p-8 rounded-xl h-full flex gap-6 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-secondary/20 flex-shrink-0 shadow-lg border border-secondary/30 group-hover:bg-secondary/40 transition-all duration-300 transform group-hover:scale-110 h-fit">
                  <Heart className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Passion for Perfection</h3>
                  <p className="text-white/70 leading-relaxed">
                    We pour passion and expertise into every floor installation, treating your project like it's our own. Our attention to detail ensures your floors will exceed expectations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/5 rounded-2xl p-0.5 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-secondary/30 overflow-hidden">
              <div className="bg-gradient-to-br from-black/80 to-black/90 p-8 rounded-xl h-full flex gap-6 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-secondary/20 flex-shrink-0 shadow-lg border border-secondary/30 group-hover:bg-secondary/40 transition-all duration-300 transform group-hover:scale-110 h-fit">
                  <Star className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Versatile Solutions</h3>
                  <p className="text-white/70 leading-relaxed">
                    From cozy homes to bustling offices, we've got you covered with top-notch hardwood, laminate, tile, or vinyl options for any space and budget.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/5 rounded-2xl p-0.5 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-secondary/30 overflow-hidden">
              <div className="bg-gradient-to-br from-black/80 to-black/90 p-8 rounded-xl h-full flex gap-6 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-secondary/20 flex-shrink-0 shadow-lg border border-secondary/30 group-hover:bg-secondary/40 transition-all duration-300 transform group-hover:scale-110 h-fit">
                  <ThumbsUp className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Customer Satisfaction</h3>
                  <p className="text-white/70 leading-relaxed">
                    We work closely with you to ensure your vision becomes a stunning reality that reflects your style and story. Our satisfied customers throughout Louisiana are our best testament.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/5 rounded-2xl p-0.5 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-secondary/30 overflow-hidden">
              <div className="bg-gradient-to-br from-black/80 to-black/90 p-8 rounded-xl h-full flex gap-6 backdrop-blur-sm">
                <div className="p-4 rounded-full bg-secondary/20 flex-shrink-0 shadow-lg border border-secondary/30 group-hover:bg-secondary/40 transition-all duration-300 transform group-hover:scale-110 h-fit">
                  <Shield className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Quality Guarantee</h3>
                  <p className="text-white/70 leading-relaxed">
                    We stand behind our work with professional installation and premium materials that last. Our quality control ensures your flooring will stand the test of time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Let's turn your vision into a stunning reality. Create spaces that reflect your style and story with APS Flooring!
            </p>
            
            <Button 
              asChild
              className="bg-secondary text-black hover:bg-secondary/90 py-6 px-12 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-500 font-semibold transform hover:-translate-y-1"
            >
              <Link href="/contact">Get Your Free Estimate</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;