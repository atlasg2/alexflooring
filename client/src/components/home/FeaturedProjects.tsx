import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Updated to show 6 projects with horizontal slider on mobile
const FeaturedProjects = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  const featuredProjects = projects.slice(0, 6);
  
  // For mobile slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProjects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
  };

  // Auto advance slides on mobile
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <section className="py-20 bg-black" id="projects">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
              Recent Projects
            </span>
          </h2>
          <div className="h-1 w-32 bg-secondary mx-auto mb-8"></div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            View our latest flooring transformations across Louisiana
          </p>
        </div>
        
        {/* Desktop: Grid with 6 projects (3x2) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredProjects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className="group relative h-[300px] rounded-lg overflow-hidden cursor-pointer">
                {/* After image */}
                <img 
                  src={project.afterImage}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Simple overlay with title */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-white/70 text-sm">
                      {project.type} | {project.location}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Mobile: Horizontal Slideshow */}
        <div className="md:hidden relative mb-12">
          <div className="overflow-hidden rounded-lg">
            <div className="relative h-[400px]">
              {featuredProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-500 transform ${
                    index === currentSlide ? 'opacity-100 translate-x-0' : 
                    index < currentSlide ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                  }`}
                >
                  <img 
                    src={project.afterImage}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-white/70 text-sm">
                      {project.type} | {project.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slide controls */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button 
                onClick={prevSlide} 
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-r-lg"
                aria-label="Previous project"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button 
                onClick={nextSlide} 
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-l-lg"
                aria-label="Next project"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            
            {/* Pagination indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {featuredProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-secondary w-4' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Simple CTA */}
        <div className="text-center">
          <Link href="/projects">
            <Button 
              className="bg-secondary text-black hover:bg-secondary/90 px-8 py-4 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;