import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Define slide interface
interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

// Define hero slides
const heroSlides: Slide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Premium Flooring Solutions",
    subtitle: "For Homes & Businesses"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Expert Installation",
    subtitle: "Exceptional Quality"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1560440021-33f9b867899d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Transforming Spaces",
    subtitle: "Throughout Louisiana"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide(index);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    goToSlide(nextIndex);
  }, [currentSlide, goToSlide, heroSlides.length]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    goToSlide(prevIndex);
  }, [currentSlide, goToSlide, heroSlides.length]);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="hero-slider h-[90vh] relative overflow-hidden">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1500 ${
            index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-110'
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={index !== currentSlide}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          
          {/* Text container with animation */}
          <div className={`absolute bottom-[15%] left-0 md:left-24 max-w-md text-left z-20 px-8 md:px-0 transform transition-all duration-1000 ${
            index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'
          }`}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 font-montserrat drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md max-w-md">
              {slide.subtitle}
            </p>
            <Link href="/contact" className="inline-block">
              <Button 
                className="bg-secondary text-black hover:bg-secondary/90 px-8 py-4 rounded-md flex items-center gap-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]"
              >
                Free Estimate <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* Slide Navigation */}
      <div className="absolute bottom-6 right-10 flex gap-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={`nav-${index}`}
            className={`w-10 h-1.5 rounded-sm transition-all ${
              index === currentSlide ? 'bg-secondary' : 'bg-white/30'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Controls */}
      <button 
        className="absolute left-6 top-1/2 z-20 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center text-white backdrop-blur-sm hover:bg-black/40 transition-all hover:scale-110"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        className="absolute right-6 top-1/2 z-20 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center text-white backdrop-blur-sm hover:bg-black/40 transition-all hover:scale-110"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </section>
  );
};

export default HeroSlider;