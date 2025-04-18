
import { useState } from "react";
import { testimonials } from "@/data/testimonials";
import { ChevronLeft, ChevronRight, Star, MapPin, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-1 bg-secondary rounded-full mr-4"></div>
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary">
              What Our Clients Say
            </h2>
            <div className="w-12 h-1 bg-secondary rounded-full ml-4"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Read what our satisfied customers throughout Louisiana have to say about their experience with APS Flooring
          </p>
        </div>
        
        {/* Desktop view: Three testimonials at once with scale effect */}
        <div className="hidden lg:block relative h-[400px] overflow-visible mb-12">
          <div className="absolute inset-x-0 flex justify-center items-center">
            {testimonials.map((testimonial, index) => {
              // Calculate position relative to current testimonial
              const position = (index - currentTestimonial + testimonials.length) % testimonials.length;
              
              // Calculate z-index, scale, and opacity based on position
              let zIndex = 10;
              let scale = 1;
              let opacity = 1;
              let translateX = '0%';
              
              if (position === 0) {
                // Current testimonial (center)
                zIndex = 30;
              } else if (position === 1 || position === testimonials.length - 1) {
                // Adjacent testimonials (left and right)
                zIndex = 20;
                scale = 0.85;
                opacity = 0.7;
                translateX = position === 1 ? '90%' : '-90%';
              } else {
                // Hidden testimonials
                zIndex = 10;
                scale = 0.7;
                opacity = 0;
                translateX = position < testimonials.length / 2 ? '180%' : '-180%';
              }
              
              return (
                <div 
                  key={testimonial.id}
                  className="absolute w-full max-w-xl p-1 transition-all duration-500 ease-in-out"
                  style={{ 
                    zIndex, 
                    transform: `translateX(${translateX}) scale(${scale})`,
                    opacity
                  }}
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 h-full flex flex-col relative">
                    {/* Quotation mark */}
                    <div className="absolute -top-4 -left-4 p-3 rounded-full bg-secondary/10 text-secondary">
                      <Quote className="h-6 w-6" />
                    </div>
                    
                    <div className="flex items-center mb-6">
                      <div className="text-secondary flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <div className="ml-auto text-sm font-semibold px-3 py-1 rounded-full bg-gray-100">
                        {testimonial.source}
                      </div>
                    </div>
                    
                    <blockquote className="text-lg text-gray-700 italic mb-8 flex-grow">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <div className="flex items-center pt-4 border-t border-gray-100">
                      <Avatar className="h-14 w-14 rounded-full border-2 border-secondary shadow-md">
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(testimonial.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-bold text-primary">{testimonial.name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 text-secondary mr-1" />
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mobile view: Single testimonial with slide transition */}
        <div className="lg:hidden relative overflow-hidden">
          <div className="relative h-[420px] overflow-hidden mb-10">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`absolute inset-0 transition-all duration-700 transform ${
                  index === currentTestimonial 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentTestimonial 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="text-secondary flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <div className="ml-auto text-sm font-semibold px-3 py-1 rounded-full bg-gray-100">
                      {testimonial.source}
                    </div>
                  </div>
                  
                  <blockquote className="text-lg text-gray-700 italic mb-6 flex-grow">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center pt-4 border-t border-gray-100">
                    <Avatar className="h-14 w-14 rounded-full border-2 border-secondary shadow-md">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-bold text-primary">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 text-secondary mr-1" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Carousel Controls */}
        <div className="flex justify-center items-center gap-6">
          <button 
            className="p-3 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:text-secondary transition-all duration-300 hover:scale-110 border border-gray-100"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Pagination dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button 
                key={`nav-${index}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-secondary scale-150' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            className="p-3 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:text-secondary transition-all duration-300 hover:scale-110 border border-gray-100"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
