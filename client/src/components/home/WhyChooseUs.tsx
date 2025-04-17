import { Home, Star, Shield, Calculator } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary mb-6">
              Why Choose APS Flooring
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              With years of experience and a commitment to quality, we deliver exceptional flooring services 
              that transform your spaces while providing excellent customer service every step of the way.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Locally Owned & Operated</h3>
                  <p className="text-gray-600">Supporting our local communities in Louisiana and Alabama.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">5-Star Google Reviews</h3>
                  <p className="text-gray-600">Consistently rated 5 stars by our satisfied customers.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Fully Licensed & Insured</h3>
                  <p className="text-gray-600">Professional installations with complete peace of mind.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">Free In-Home Estimates</h3>
                  <p className="text-gray-600">Personalized service with transparent, no-obligation quotes.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-xl transform transition-all duration-700 hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="APS Flooring Team at Work" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 hover:translate-y-[-8px]">
                <div className="inline-block bg-secondary text-white px-4 py-1 rounded-full text-sm font-medium mb-3">Master Craftsman</div>
                <h3 className="text-2xl font-bold text-white">Alex Smith</h3>
                <p className="text-white/90">Owner & Master Installer</p>
                <p className="text-white/80 mt-2 max-w-md">With over 15 years of experience in premium flooring installation, Alex leads our team with expertise and dedication to quality.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
