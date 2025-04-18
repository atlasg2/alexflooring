import { useState } from "react";
import { testimonials } from "@/data/testimonials";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative inline-block">
            What Our Clients Say
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Read reviews from our satisfied customers throughout Louisiana.
          </p>
        </div>
        
        <div className="testimonial-carousel relative max-w-4xl mx-auto">
          {/* Testimonial Slides */}
          <div className="relative h-[400px] overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`testimonial-slide absolute inset-0 transition-all duration-700 transform ${
                  index === currentTestimonial 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentTestimonial 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="text-secondary flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 fill-current" />
                      ))}
                    </div>
                    <div className="ml-auto text-sm font-semibold px-4 py-1.5 rounded-full bg-gray-100 shadow-sm">via {testimonial.source}</div>
                  </div>
                  <blockquote className="text-xl text-gray-700 italic mb-8 leading-relaxed flex-grow">"<span className="text-primary font-medium">{testimonial.quote}</span>"</blockquote>
                  <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
                    <Avatar className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-3 border-secondary shadow-md">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary text-white text-lg font-bold">{getInitials(testimonial.name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-bold text-primary text-lg">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 flex items-center"><MapPin className="h-3.5 w-3.5 text-secondary mr-1" /> {testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Navigation */}
          <div className="flex justify-center mt-10 gap-3">
            {testimonials.map((_, index) => (
              <button 
                key={`nav-${index}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-secondary scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Carousel Controls */}
          <button 
            className="absolute top-1/2 -left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:bg-gray-50 transition-all duration-300 hover:scale-110 md:-left-16"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            className="absolute top-1/2 -right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:bg-gray-50 transition-all duration-300 hover:scale-110 md:-right-16"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
