import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Transform Your Space with Beautiful Flooring",
    subtitle: "Serving Homeowners in Louisiana and Alabama"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1604014056359-c3be0894c0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Premium Flooring Solutions",
    subtitle: "Quality Materials & Expert Installation"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1581922819941-6ab31ab79afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Experience the APS Flooring Difference",
    subtitle: "Professional Service from Start to Finish"
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
    <section className="hero-slider pt-16">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={index !== currentSlide}
        >
          <div className="absolute inset-0 bg-dark bg-opacity-50"></div>
          <div className="slide-content absolute inset-0 flex items-center justify-center text-center p-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-montserrat leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-white mb-8 font-light">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  asChild
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-lg text-lg"
                >
                  <a href="#services">Learn More</a>
                </Button>
                <Button 
                  asChild
                  className="bg-secondary text-white hover:bg-yellow-500 py-3 px-8 rounded-lg text-lg"
                >
                  <Link href="/contact">Get a Free Estimate</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={`nav-${index}`}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white bg-opacity-90' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Controls (optional) */}
      <button 
        className="absolute left-4 top-1/2 z-20 w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/50 transition-all"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        className="absolute right-4 top-1/2 z-20 w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/50 transition-all"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </section>
  );
};

export default HeroSlider;