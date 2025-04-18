import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Construction, Info } from "lucide-react";

// Enhanced slide interface with specific flooring type and buttons
interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  flooringType: string;
  description: string;
  ctaLink: string;
  learnMoreLink: string;
}

// Define hero slides with specific flooring types
const heroSlides: Slide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Hardwood Flooring",
    subtitle: "Timeless Elegance for Your Home",
    flooringType: "Hardwood",
    description: "Premium oak, maple, and walnut hardwood floors that add warmth and character to any room.",
    ctaLink: "/contact",
    learnMoreLink: "/services/hardwood-flooring"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Luxury Vinyl Plank",
    subtitle: "Waterproof & Durable",
    flooringType: "LVP",
    description: "The perfect combination of beauty and practicality with waterproof, scratch-resistant luxury vinyl.",
    ctaLink: "/contact",
    learnMoreLink: "/services/luxury-vinyl-flooring"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1560440021-33f9b867899d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Custom Tile",
    subtitle: "Premium Tile Installations",
    flooringType: "Tile",
    description: "Beautiful, durable ceramic and porcelain tile flooring for kitchens, bathrooms, and more.",
    ctaLink: "/contact",
    learnMoreLink: "/services/tile-flooring"
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Carpet Flooring",
    subtitle: "Comfort & Style Underfoot",
    flooringType: "Carpet",
    description: "Soft, plush carpet options that bring warmth and comfort to bedrooms and living areas.",
    ctaLink: "/contact",
    learnMoreLink: "/services/carpet-flooring"
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
          <div className={`absolute bottom-[15%] left-0 md:left-24 max-w-lg text-left z-20 px-8 md:px-0 transform transition-all duration-1000 ${
            index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'
          }`}>
            {/* Flooring type tag */}
            <span className="inline-block bg-secondary/90 text-black px-4 py-1.5 rounded-full text-sm font-semibold mb-4 shadow-md">
              {slide.flooringType}
            </span>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2 font-montserrat drop-shadow-md">
              {slide.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-3 drop-shadow-md">
              {slide.subtitle}
            </p>
            
            <p className="text-white/80 mb-8 max-w-md">
              {slide.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {/* Free Estimate Button */}
              <Link href={slide.ctaLink} className="inline-block">
                <Button 
                  className="bg-secondary text-black hover:bg-secondary/90 px-6 py-3 rounded-md flex items-center gap-2 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]"
                >
                  <Construction className="h-4 w-4" /> Free Estimate
                </Button>
              </Link>
              
              {/* Learn More Button */}
              <Link href={slide.learnMoreLink} className="inline-block">
                <Button 
                  variant="outline"
                  className="bg-black/40 text-white border-white/30 hover:bg-black/60 px-6 py-3 rounded-md flex items-center gap-2 text-base font-semibold backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px]"
                >
                  <Info className="h-4 w-4" /> Learn More
                </Button>
              </Link>
            </div>
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