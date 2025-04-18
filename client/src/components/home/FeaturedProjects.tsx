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
    <section id="projects" className="pt-36 pb-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70">
              Featured Transformations
            </span>
          </h2>
          <div className="h-1 w-32 bg-secondary mx-auto mt-5 mb-8"></div>
          <p className="mt-4 text-xl text-white/80 max-w-2xl mx-auto">
            Browse our portfolio of stunning flooring installations that showcase our expertise and attention to detail
          </p>
        </div>

        {/* New masonry-style project grid for both residential and commercial */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Featured Project - Large Highlight */}
          <div className="lg:col-span-2 row-span-2 group relative overflow-hidden rounded-xl h-[600px] shadow-lg hover:shadow-xl transition-all duration-500" data-aos="fade-up">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url(${residentialProjects[0]?.afterImage || "https://images.unsplash.com/photo-1600607686527-6fb886090705"})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80" />
            
            <div className="absolute inset-x-0 bottom-0 p-8">
              <span className="inline-block bg-secondary/90 text-black px-3 py-1 rounded-full text-sm font-semibold mb-4">Featured Project</span>
              <h3 className="text-3xl font-bold text-white mb-3">{residentialProjects[0]?.title || "Modern Home Transformation"}</h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed max-w-xl">
                {residentialProjects[0]?.description || "Complete home renovation featuring premium hardwood throughout the main living spaces with custom inlays and borders."}
              </p>
              <Link
                href={`/projects/${residentialProjects[0]?.id || "1"}`}
                className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-white/20 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
              >
                View Project Details <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Smaller Project Cards */}
          {[...residentialProjects, ...commercialProjects].slice(1, 6).map((project, index) => (
            <div 
              key={project.id} 
              className="group relative overflow-hidden rounded-xl h-[350px] shadow-lg hover:shadow-xl transition-all duration-500"
              data-aos="fade-up"
              data-aos-delay={100 * (index + 1)}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundImage: `url(${project.afterImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />
              
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="inline-block bg-black/50 backdrop-blur-sm text-secondary px-3 py-1 rounded-full text-xs font-medium mb-3">{project.category === 'residential' ? 'Residential' : 'Commercial'}</span>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center text-secondary hover:text-white transition-colors duration-300 text-sm font-semibold"
                >
                  See Details <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Before & After Showcase */}
        <div className="rounded-xl overflow-hidden mb-16 bg-gray-900/50 p-1">
          <div className="relative h-[500px] overflow-hidden rounded-lg">
            {residentialProjects[1] && (
              <>
                <div className="absolute inset-0 bg-cover bg-center z-10" style={{ backgroundImage: `url(${residentialProjects[1].afterImage})` }}></div>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${residentialProjects[1].beforeImage})` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full text-lg font-semibold">Before</div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md rounded-full p-4 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-black" />
                  </div>
                </div>
                
                <div className="absolute bottom-6 right-6 z-20 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-full text-lg font-semibold">
                  After
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-center gap-6 flex-wrap">
          <Link
            href="/projects?category=residential"
            className="group inline-flex items-center px-8 py-4 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            Residential Projects
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="/projects?category=commercial"
            className="group inline-flex items-center px-8 py-4 bg-black text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            Commercial Projects
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;