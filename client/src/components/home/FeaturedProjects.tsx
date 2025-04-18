
import { useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Filter projects by category
const residentialProjects = projects.filter(project => project.category === 'residential');
const commercialProjects = projects.filter(project => project.category === 'commercial');

// Enhanced project card for both residential and commercial
const ProjectCard = ({ project }: { project: typeof projects[0] }) => (
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

const FeaturedProjects = () => {
  // State for project sliders
  const [activeResidentialIndex, setActiveResidentialIndex] = useState(0);
  const [activeCommercialIndex, setActiveCommercialIndex] = useState(0);
  const totalResidentialProjects = residentialProjects.length;
  const totalCommercialProjects = commercialProjects.length;

  // Refs for horizontal scrolling containers
  const residentialScrollRef = useRef<HTMLDivElement>(null);
  const commercialScrollRef = useRef<HTMLDivElement>(null);

  // Scroll the residential projects container
  const scrollResidential = (direction: 'left' | 'right') => {
    if (!residentialScrollRef.current) return;

    const container = residentialScrollRef.current;
    const scrollAmount = container.clientWidth; // Scroll by full container width

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setActiveResidentialIndex(prev => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setActiveResidentialIndex(prev => Math.min(totalResidentialProjects - 1, prev + 1));
    }
  };

  // Scroll the commercial projects container
  const scrollCommercial = (direction: 'left' | 'right') => {
    if (!commercialScrollRef.current) return;

    const container = commercialScrollRef.current;
    const scrollAmount = container.clientWidth; // Scroll by full container width

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setActiveCommercialIndex(prev => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setActiveCommercialIndex(prev => Math.min(totalCommercialProjects - 1, prev + 1));
    }
  };

  return (
    <section id="projects" className="py-24 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
              Our Recent Projects
            </span>
          </h2>
          <div className="h-1 w-24 bg-secondary mx-auto mt-4 mb-6"></div>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            See the transformation in our flooring installations throughout Louisiana
          </p>
        </div>

        {/* Residential Projects Section */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Residential Projects</h3>
          
          {/* Residential Projects Carousel */}
          <div className="relative mb-10 overflow-hidden">
            {/* Navigation buttons positioned in the middle of the carousel */}
            <button 
              onClick={() => scrollResidential('left')}
              disabled={activeResidentialIndex === 0}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
                activeResidentialIndex === 0 ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' : 'bg-black/60 text-white hover:bg-black/80'
              } transition-all duration-300 backdrop-blur-sm`}
              aria-label="Previous residential projects"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => scrollResidential('right')}
              disabled={activeResidentialIndex === totalResidentialProjects - 1}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
                activeResidentialIndex === totalResidentialProjects - 1 ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' : 'bg-black/60 text-white hover:bg-black/80'
              } transition-all duration-300 backdrop-blur-sm`}
              aria-label="Next residential projects"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Scrollable container */}
            <div 
              ref={residentialScrollRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            >
              {residentialProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="flex-none w-full md:w-[95%] lg:w-[90%] snap-center"
                  style={{scrollSnapAlign: 'center'}}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {residentialProjects.map((_, index) => (
              <button
                key={`residential-dot-${index}`}
                className={`w-8 h-1.5 rounded-sm transition-all ${
                  index === activeResidentialIndex ? 'bg-secondary' : 'bg-white/20'
                }`}
                onClick={() => {
                  if (residentialScrollRef.current) {
                    const container = residentialScrollRef.current;
                    const cardWidth = container.clientWidth;
                    container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
                    setActiveResidentialIndex(index);
                  }
                }}
                aria-label={`Go to residential project ${index + 1}`}
              />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/projects?category=residential"
              className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              View All Residential Projects
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Commercial Projects Section - Matching the residential design */}
        <div className="pt-10 mt-16 relative border-t border-white/10">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Commercial Projects</h3>
          
          {/* Commercial Projects Carousel */}
          <div className="relative mb-10 overflow-hidden">
            {/* Navigation buttons positioned in the middle of the carousel */}
            <button 
              onClick={() => scrollCommercial('left')}
              disabled={activeCommercialIndex === 0}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
                activeCommercialIndex === 0 ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' : 'bg-black/60 text-white hover:bg-black/80'
              } transition-all duration-300 backdrop-blur-sm`}
              aria-label="Previous commercial projects"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => scrollCommercial('right')}
              disabled={activeCommercialIndex === totalCommercialProjects - 1}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
                activeCommercialIndex === totalCommercialProjects - 1 ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' : 'bg-black/60 text-white hover:bg-black/80'
              } transition-all duration-300 backdrop-blur-sm`}
              aria-label="Next commercial projects"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Scrollable container */}
            <div 
              ref={commercialScrollRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            >
              {commercialProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="flex-none w-full md:w-[95%] lg:w-[90%] snap-center"
                  style={{scrollSnapAlign: 'center'}}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {commercialProjects.map((_, index) => (
              <button
                key={`commercial-dot-${index}`}
                className={`w-8 h-1.5 rounded-sm transition-all ${
                  index === activeCommercialIndex ? 'bg-secondary' : 'bg-white/20'
                }`}
                onClick={() => {
                  if (commercialScrollRef.current) {
                    const container = commercialScrollRef.current;
                    const cardWidth = container.clientWidth;
                    container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
                    setActiveCommercialIndex(index);
                  }
                }}
                aria-label={`Go to commercial project ${index + 1}`}
              />
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
