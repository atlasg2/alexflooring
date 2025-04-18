import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, Calendar, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { allReviews } from "@/data/allReviews";

// Use the first 10 reviews for the frontend testimonials
export const googleReviews = allReviews.slice(0, 10);

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Set up automatic slideshow
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplay) {
      interval = setInterval(() => {
        nextTestimonial();
      }, 5000); // Change every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, currentTestimonial]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % googleReviews.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + googleReviews.length) % googleReviews.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
    // Pause autoplay when user manually changes slides
    setAutoplay(false);
    
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => {
      setAutoplay(true);
    }, 10000);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  // Show 3 reviews for desktop, all for mobile
  const desktopReviews = googleReviews.slice(0, 3);
  const mobileReviews = googleReviews;

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
          <p className="text-white/90 mt-4">Showing {googleReviews.length} of {allReviews.length} total 5-star reviews</p>
        </div>
        
        {/* Desktop view - Featured reviews grid plus slideshow controls */}
        <div className="hidden lg:flex flex-col">
          {/* Top featured reviews */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {desktopReviews.map((review) => (
              <div key={review.id} className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl transition-transform hover:scale-105">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-secondary flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full">
                    <Quote className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-medium text-secondary">Google Review</span>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 mb-5 min-h-[150px] relative">
                  <Quote className="h-8 w-8 text-secondary/10 absolute -left-2 -top-2" />
                  <div className="pt-2 pl-2">"{review.quote}"</div>
                </blockquote>
                
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 rounded-full border-2 border-secondary shadow-sm">
                      <AvatarImage src={review.image} alt={review.name} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(review.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-semibold text-primary">{review.name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{review.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(review.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* View all reviews indicator */}
          <div className="flex justify-center items-center space-x-4 mb-4">
            <hr className="w-1/4 border-white/30" />
            <span className="text-white text-sm">Scroll through {googleReviews.length} featured reviews</span>
            <hr className="w-1/4 border-white/30" />
          </div>
          
          {/* Slideshow controls for desktop */}
          <div className="flex justify-center items-center gap-8">
            <button 
              className="p-3 rounded-full bg-white/80 shadow-md flex items-center justify-center text-primary hover:text-secondary transition-all duration-300"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Current review indicator */}
            <div className="bg-white/80 text-primary rounded-full px-4 py-2 font-medium">
              {currentTestimonial + 1} of {googleReviews.length}
            </div>
            
            <button 
              className="p-3 rounded-full bg-white/80 shadow-md flex items-center justify-center text-primary hover:text-secondary transition-all duration-300"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center mt-4 gap-2">
            {googleReviews.map((_, index) => (
              <button 
                key={`desktop-nav-${index}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-secondary scale-125' : 'bg-white/60 hover:bg-white'
                }`}
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Mobile view - Enhanced Slideshow */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden mx-auto max-w-md">
            <div className="relative bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-8 transition-opacity duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="text-secondary flex">
                  {[...Array(mobileReviews[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full">
                  <Quote className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-medium text-secondary">Google Review</span>
                </div>
              </div>
              
              {/* Quote mark */}
              <div className="absolute -left-2 top-16 text-secondary/10">
                <Quote size={60} />
              </div>
              
              <blockquote className="text-gray-700 mb-5 min-h-[120px] relative z-10 pl-2">
                "{mobileReviews[currentTestimonial].quote}"
              </blockquote>
              
              <div className="flex flex-col space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-secondary shadow-sm">
                    <AvatarImage 
                      src={mobileReviews[currentTestimonial].image} 
                      alt={mobileReviews[currentTestimonial].name} 
                    />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(mobileReviews[currentTestimonial].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-semibold text-primary">{mobileReviews[currentTestimonial].name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{mobileReviews[currentTestimonial].location}</span>
                    </div>
                  </div>
                </div>
                
                {/* Date information */}
                <div className="flex items-center text-xs text-gray-500 justify-end">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(mobileReviews[currentTestimonial].date)}</span>
                </div>
              </div>
            </div>
            
            {/* Slide counter */}
            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentTestimonial + 1} / {mobileReviews.length}
            </div>
            
            {/* Mobile Navigation Controls */}
            <div className="flex justify-between items-center gap-6">
              <button 
                className="p-3 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary hover:text-secondary transition-all duration-300"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              {/* Pagination dots */}
              <div className="flex gap-2">
                {mobileReviews.map((_, index) => (
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
                className="p-3 rounded-full bg-white/90 shadow-md flex items-center justify-center text-primary hover:text-secondary transition-all duration-300"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;