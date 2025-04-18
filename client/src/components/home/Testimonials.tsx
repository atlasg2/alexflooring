
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Only keeping Google reviews
const googleReviews = [
  {
    id: "1",
    name: "Jennifer R.",
    location: "New Orleans, LA",
    quote: "APS Flooring completely transformed our home with beautiful hardwood floors. The team was professional, on time, and left our space cleaner than when they started. Highly recommend!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/54.jpg",
    source: "Google"
  },
  {
    id: "2",
    name: "Michael T.",
    location: "Birmingham, AL",
    quote: "We had LVP installed throughout our first floor. The crew was incredible - fast, clean, and the floors look amazing. Alex was very knowledgeable and helped us pick the perfect style.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    source: "Google"
  },
  {
    id: "4",
    name: "David W.",
    location: "Hoover, AL",
    quote: "Professional, punctual, and perfect work. My new bathroom shower tile is exactly what I wanted. They were clean, respectful of my home, and completed the job on schedule.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/82.jpg",
    source: "Google"
  }
];

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % googleReviews.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + googleReviews.length) % googleReviews.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <section className="py-20 bg-cover bg-center bg-fixed relative" 
      style={{ backgroundImage: "url(https://images.unsplash.com/photo-1610218588183-6a09a1e0f4f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80)" }}>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white mb-4">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
        </div>
        
        {/* Desktop view - All three reviews at once */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-12">
          {googleReviews.map((review) => (
            <div key={review.id} className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl transition-transform hover:scale-105">
              <div className="flex justify-between items-center mb-4">
                <div className="text-secondary flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center">
                  <Quote className="h-5 w-5 text-secondary mr-1" />
                  <span className="text-sm font-medium text-gray-600">Google Review</span>
                </div>
              </div>
              
              <blockquote className="text-gray-700 mb-5 min-h-[150px]">
                "{review.quote}"
              </blockquote>
              
              <div className="flex items-center border-t border-gray-200 pt-4">
                <Avatar className="h-12 w-12 rounded-full border-2 border-secondary shadow-sm">
                  <AvatarImage src={review.image} alt={review.name} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(review.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-semibold text-primary">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile view - Slideshow */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden mx-auto max-w-md">
            <div className="relative bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="text-secondary flex">
                  {[...Array(googleReviews[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center">
                  <Quote className="h-5 w-5 text-secondary mr-1" />
                  <span className="text-sm font-medium text-gray-600">Google Review</span>
                </div>
              </div>
              
              <blockquote className="text-gray-700 mb-5 min-h-[120px]">
                "{googleReviews[currentTestimonial].quote}"
              </blockquote>
              
              <div className="flex items-center border-t border-gray-200 pt-4">
                <Avatar className="h-12 w-12 rounded-full border-2 border-secondary shadow-sm">
                  <AvatarImage 
                    src={googleReviews[currentTestimonial].image} 
                    alt={googleReviews[currentTestimonial].name} 
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(googleReviews[currentTestimonial].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-semibold text-primary">{googleReviews[currentTestimonial].name}</p>
                  <p className="text-sm text-gray-500">{googleReviews[currentTestimonial].location}</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Navigation Controls */}
            <div className="flex justify-center items-center gap-6">
              <button 
                className="p-2 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary hover:text-secondary transition-all duration-300"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Pagination dots */}
              <div className="flex gap-2">
                {googleReviews.map((_, index) => (
                  <button 
                    key={`nav-${index}`}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-secondary scale-150' : 'bg-white/60 hover:bg-white'
                    }`}
                    onClick={() => goToTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                className="p-2 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary hover:text-secondary transition-all duration-300"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
