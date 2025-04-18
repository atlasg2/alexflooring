import { useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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

// Commercial project card - simplified design
const CommercialProjectCard = ({ project }: { project: typeof projects[0] }) => (
  <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
    <div className="h-[300px] relative">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${project.afterImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40" />
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
      <p className="text-white/80 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center text-secondary font-medium text-sm hover:text-white transition-colors duration-300"
      >
        View Details <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  </div>
);

const FeaturedProjects = () => {
  // State for residential projects slider
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
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Residential Projects</h3>

            {/* Navigation controls moved next to the heading */}
            <div className="flex gap-3">
              <button 
                onClick={() => scrollResidential('left')}
                disabled={activeResidentialIndex === 0}
                className={`p-3 rounded-full ${activeResidentialIndex === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'} transition-all duration-300`}
                aria-label="Previous residential projects"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scrollResidential('right')}
                disabled={activeResidentialIndex === totalResidentialProjects - 1}
                className={`p-3 rounded-full ${activeResidentialIndex === totalResidentialProjects - 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'} transition-all duration-300`}
                aria-label="Next residential projects"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Residential Projects Carousel */}
          <div className="relative mb-10 overflow-hidden">
            <div 
              ref={residentialScrollRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            >
              {residentialProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="flex-none w-full md:w-[400px] lg:w-[450px] xl:w-[500px] snap-center"
                  style={{scrollSnapAlign: 'start'}}
                >
                  <ResidentialProjectCard project={project} />
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

        {/* Commercial Projects Section - Completely redesigned */}
        <div className="pt-10 mt-16 relative border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Commercial Projects</h3>

            {/* Navigation controls moved next to the heading */}
            <div className="flex gap-3">
              <button 
                onClick={() => scrollCommercial('left')}
                disabled={activeCommercialIndex === 0}
                className={`p-3 rounded-full ${activeCommercialIndex === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'} transition-all duration-300`}
                aria-label="Previous commercial projects"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scrollCommercial('right')}
                disabled={activeCommercialIndex === totalCommercialProjects - 1}
                className={`p-3 rounded-full ${activeCommercialIndex === totalCommercialProjects - 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'} transition-all duration-300`}
                aria-label="Next commercial projects"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Commercial Projects Grid */}
          <div 
            ref={commercialScrollRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {commercialProjects.map((project) => (
              <CommercialProjectCard key={project.id} project={project} />
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