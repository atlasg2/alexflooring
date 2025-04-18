import { useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { MapPin, Home, Store, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Filter projects by category
const residentialProjects = projects.filter(project => project.category === 'residential');
const commercialProjects = projects.filter(project => project.category === 'commercial');

// Enhanced project card for residential
const ResidentialProjectCard = ({ project }: { project: typeof projects[0] }) => (
  <div className="relative group overflow-hidden rounded-xl h-[450px] shadow-lg hover:shadow-xl transition-all duration-500">
    {/* Project image with zoom effect on hover */}
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 filter brightness-95 group-hover:brightness-105"
      style={{ backgroundImage: `url(${project.afterImage})` }}
    />
    
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80" />
    
    {/* Content at bottom with slide-up effect */}
    <div className="absolute inset-x-0 bottom-0 p-8 transform transition-all duration-500 ease-in-out translate-y-2 group-hover:translate-y-0">
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <div className="bg-secondary text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">
          {project.type}
        </div>
        <div className="flex items-center text-white/90 text-xs backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full">
          <MapPin className="h-3 w-3 mr-1.5 text-secondary" /> 
          {project.location}
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-md">{project.title}</h3>
      
      <p className="text-white/90 text-sm mb-5 line-clamp-2 leading-relaxed max-w-md">
        {project.description}
      </p>
      
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center text-white bg-secondary/90 backdrop-blur-sm py-2.5 px-5 rounded-lg font-semibold text-sm hover:bg-secondary transition-all duration-300 shadow-md hover:shadow-lg transform group-hover:translate-y-0 hover:-translate-y-1"
      >
        View Project <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  </div>
);

// Commercial project with before/after comparison
const BeforeAfterProject = ({ project }: { project: typeof projects[0] }) => (
  <div className="overflow-hidden rounded-lg bg-black">
    <div className="relative flex flex-col">
      {/* Before/After image comparison */}
      <div className="relative h-[350px] md:h-[500px] overflow-hidden flex">
        <div className="w-1/2 h-full relative border-r border-white/50">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${project.beforeImage})` }}
          />
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-semibold">
            Before
          </div>
        </div>
        
        <div className="w-1/2 h-full relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${project.afterImage})` }}
          />
          <div className="absolute top-4 right-4 bg-secondary/90 text-black px-3 py-1 rounded text-sm font-semibold">
            After
          </div>
        </div>
      </div>
      
      {/* Project details */}
      <div className="p-8 bg-white border-t-4 border-secondary">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-1">{project.title}</h3>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1 text-secondary" /> 
              {project.location}
            </div>
          </div>
          <div className="bg-gray-100 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {project.type}
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          {project.description}
        </p>
        
        {project.testimonial && (
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-secondary mb-6">
            <p className="text-gray-700 italic">"{project.testimonial.substring(0, 120)}..."</p>
            {project.clientName && (
              <p className="text-primary font-medium mt-2">— {project.clientName}</p>
            )}
          </div>
        )}
        
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center text-secondary font-medium hover:text-primary transition-colors duration-300"
        >
          View Full Project Details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  </div>
);

// Main component starts here

const FeaturedProjects = () => {
  // State for residential projects slider
  const [activeIndex, setActiveIndex] = useState(0);
  const totalResidentialProjects = residentialProjects.length;
  
  // Refs for horizontal scrolling containers
  const residentialScrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll the residential projects container
  const scrollResidential = (direction: 'left' | 'right') => {
    if (!residentialScrollRef.current) return;
    
    const container = residentialScrollRef.current;
    const scrollAmount = container.clientWidth; // Scroll by full container width
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setActiveIndex(prev => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setActiveIndex(prev => Math.min(totalResidentialProjects - 1, prev + 1));
    }
  };
  
  return (
    <section id="projects" className="py-24 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
              Our Recent Projects
            </span>
          </h2>
          <div className="h-1 w-24 bg-secondary mx-auto mt-4 mb-6"></div>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            See the transformation in our flooring installations throughout Louisiana
          </p>
        </div>
        
        {/* Residential Projects Section */}
        <div className="mb-24 relative">
          {/* Background design elements */}
          <div className="absolute top-20 -right-10 w-64 h-64 border-2 border-secondary/10 rounded-full opacity-10"></div>
          <div className="absolute -bottom-20 -left-10 w-48 h-48 border-2 border-secondary/20 rounded-full opacity-10"></div>
          
          {/* Section header with navigation controls */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg border border-secondary/30">
                <Home className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Residential Projects</h2>
                <div className="h-1 w-20 bg-secondary"></div>
              </div>
            </div>
            
            {/* Slider controls */}
            <div className="flex gap-3">
              <button 
                onClick={() => scrollResidential('left')}
                disabled={activeIndex === 0}
                className={`p-3 rounded-full ${activeIndex === 0 ? 'bg-gray-800 text-gray-600' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'} transition-all duration-300`}
                aria-label="Previous slides"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scrollResidential('right')}
                disabled={activeIndex === totalResidentialProjects - 1}
                className={`p-3 rounded-full ${activeIndex === totalResidentialProjects - 1 ? 'bg-gray-800 text-gray-600' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'} transition-all duration-300`}
                aria-label="Next slides"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <p className="text-white/70 max-w-3xl mb-8 text-lg">
            Premium flooring solutions for homes across Louisiana, from hardwood installations to bathroom remodels and historic floor refinishing.
          </p>
          
          {/* Residential Projects Horizontal Slider */}
          <div 
            className="relative mb-10 overflow-hidden"
          >
            <div 
              ref={residentialScrollRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            >
              {residentialProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="flex-none w-full md:w-[400px] lg:w-[450px] xl:w-[500px] snap-center"
                  style={{scrollSnapAlign: 'start'}}
                >
                  <ResidentialProjectCard project={project} />
                </div>
              ))}
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-6">
              {residentialProjects.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className={`w-8 h-1.5 rounded-sm transition-all ${
                    index === activeIndex ? 'bg-secondary' : 'bg-white/20'
                  }`}
                  onClick={() => {
                    if (residentialScrollRef.current) {
                      const container = residentialScrollRef.current;
                      const cardWidth = container.clientWidth;
                      container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
                      setActiveIndex(index);
                    }
                  }}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Link
              href="/projects?category=residential"
              className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              View All Residential Projects
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        
        {/* Commercial Projects Section */}
        <div className="pt-20 mt-16 relative border-t border-white/10">
          <div className="absolute top-10 left-0 w-40 h-40 border-2 border-secondary/20 rounded-full opacity-10"></div>
          
          <div className="flex items-center mb-10 gap-4">
            <div className="p-4 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg border border-secondary/30">
              <Store className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Commercial Projects</h2>
              <div className="h-1 w-20 bg-secondary"></div>
            </div>
          </div>
          
          <p className="text-white/70 max-w-3xl mb-10 text-lg">
            Long-lasting, high-performance flooring for offices, restaurants, retail spaces, and other commercial environments throughout Louisiana.
          </p>
          
          {/* Commercial Projects with Before/After Comparison */}
          <div className="flex overflow-x-auto gap-6 pb-10 snap-x hide-scrollbar">
            {commercialProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="flex-none w-full snap-center"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1 shadow-2xl overflow-hidden border border-white/10">
                  <BeforeAfterProject project={project} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 flex justify-center">
            <Link
              href="/projects?category=commercial"
              className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              View All Commercial Projects
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;