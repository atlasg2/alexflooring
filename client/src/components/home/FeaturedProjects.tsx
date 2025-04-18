import { useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { MapPin, Home, Store, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Building from "lucide-react/Building"; // Added import for Building icon


// Filter projects by category
const residentialProjects = projects.filter(project => project.category === 'residential');
const commercialProjects = projects.filter(project => project.category === 'commercial');

// Enhanced project card for residential (This remains unchanged)
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

// Commercial project with before/after comparison (This remains unchanged)
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


const FeaturedProjects = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [commercialIndex, setCommercialIndex] = useState(0); // Added state for commercial project index
  const totalResidentialProjects = residentialProjects.length;
  const totalCommercialProjects = commercialProjects.length; // Added variable for total commercial projects

  const navigateResidential = (direction: 'prev' | 'next') => {
    let newIndex = activeIndex;
    if (direction === 'prev') {
      newIndex = (newIndex - 1 + totalResidentialProjects) % totalResidentialProjects;
    } else {
      newIndex = (newIndex + 1) % totalResidentialProjects;
    }
    setActiveIndex(newIndex);
  };

  const navigateCommercial = (direction: 'prev' | 'next') => {
    let newIndex = commercialIndex;
    if (direction === 'prev') {
      newIndex = (newIndex - 1 + totalCommercialProjects) % totalCommercialProjects;
    } else {
      newIndex = (newIndex + 1) % totalCommercialProjects;
    }
    setCommercialIndex(newIndex);
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
            Explore our portfolio of stunning residential and commercial flooring transformations
          </p>
        </div>

        {/* Residential Projects Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Home className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-white">Residential Projects</h3>
            </div>
          </div>

          {/* Single Project Slideshow with Navigation */}
          <div className="relative max-w-4xl mx-auto">
            {/* Navigation Buttons */}
            <button 
              onClick={() => navigateResidential('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-300"
              aria-label="Previous project"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button 
              onClick={() => navigateResidential('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-300"
              aria-label="Next project"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Project Display */}
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative">
                {residentialProjects[activeIndex] && (
                  <BeforeAfterSlider
                    beforeImage={residentialProjects[activeIndex].beforeImage}
                    afterImage={residentialProjects[activeIndex].afterImage}
                    beforeAlt={`Before: ${residentialProjects[activeIndex].title}`}
                    afterAlt={`After: ${residentialProjects[activeIndex].title}`}
                  />
                )}
              </div>

              <div className="p-6">
                <h4 className="text-xl font-bold text-white">
                  {residentialProjects[activeIndex]?.title || "Loading..."}
                </h4>
                <p className="text-gray-400 mt-2">
                  {residentialProjects[activeIndex]?.description || "Loading..."}
                </p>

                <div className="flex flex-wrap items-center justify-between mt-4 gap-y-2">
                  <span className="text-xs bg-secondary/20 text-secondary py-1 px-3 rounded-full">
                    {residentialProjects[activeIndex]?.type || "Loading..."}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-secondary" /> 
                    {residentialProjects[activeIndex]?.location || "Loading..."}
                  </span>
                </div>

                {/* Pagination Indicators */}
                <div className="flex justify-center mt-6 gap-2">
                  {residentialProjects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === activeIndex ? 'bg-secondary w-5' : 'bg-gray-600'
                      }`}
                      aria-label={`Go to project ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="mt-8 flex justify-center">
            <Link 
              href="/projects?category=residential"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              View All Residential Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Commercial Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Building className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-white">Commercial Projects</h3>
            </div>
          </div>

          {/* Single Commercial Project Slideshow */}
          <div className="relative max-w-4xl mx-auto">
            {/* Navigation Buttons */}
            <button 
              onClick={() => navigateCommercial('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-300"
              aria-label="Previous commercial project"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>

            <button 
              onClick={() => navigateCommercial('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-300"
              aria-label="Next commercial project"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Commercial Project Display */}
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative">
                {commercialProjects[commercialIndex] && (
                  <BeforeAfterSlider
                    beforeImage={commercialProjects[commercialIndex].beforeImage}
                    afterImage={commercialProjects[commercialIndex].afterImage}
                    beforeAlt={`Before: ${commercialProjects[commercialIndex].title}`}
                    afterAlt={`After: ${commercialProjects[commercialIndex].title}`}
                  />
                )}
              </div>

              <div className="p-6">
                <h4 className="text-xl font-bold text-white">
                  {commercialProjects[commercialIndex]?.title || "Loading..."}
                </h4>
                <p className="text-gray-400 mt-2">
                  {commercialProjects[commercialIndex]?.description || "Loading..."}
                </p>

                <div className="flex flex-wrap items-center justify-between mt-4 gap-y-2">
                  <span className="text-xs bg-secondary/20 text-secondary py-1 px-3 rounded-full">
                    {commercialProjects[commercialIndex]?.type || "Loading..."}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-secondary" /> 
                    {commercialProjects[commercialIndex]?.location || "Loading..."}
                  </span>
                </div>

                {/* Pagination Indicators */}
                <div className="flex justify-center mt-6 gap-2">
                  {commercialProjects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCommercialIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === commercialIndex ? 'bg-secondary w-5' : 'bg-gray-600'
                      }`}
                      aria-label={`Go to commercial project ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="mt-8 flex justify-center">
            <Link 
              href="/projects?category=commercial"
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              View All Commercial Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;