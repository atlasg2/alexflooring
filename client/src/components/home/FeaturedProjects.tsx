import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { MapPin, Home, Store, ArrowRight } from "lucide-react";

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

const FeaturedProjects = () => {
  return (
    <section id="projects" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary relative inline-block">
            Our Projects
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            See the transformation in our recent flooring installations.
          </p>
        </div>
        
        {/* Residential Projects Section */}
        <div className="mb-24">
          <div className="flex items-center mb-8 gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-primary relative">
              Residential Projects
              <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
            </h2>
          </div>
          
          <p className="text-gray-600 max-w-3xl mb-10">
            Premium flooring solutions for homes, from hardwood installations to bathroom remodels and floor refinishing.
          </p>
          
          {/* Residential Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {residentialProjects.slice(0, 3).map(project => (
              <ResidentialProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="mt-10 flex justify-center">
            <Link
              href="/projects?category=residential"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              View All Residential Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* Commercial Projects Section */}
        <div className="pt-10 mt-10 border-t border-gray-200">
          <div className="flex items-center mb-8 gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-primary relative">
              Commercial Projects
              <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
            </h2>
          </div>
          
          <p className="text-gray-600 max-w-3xl mb-10">
            Long-lasting, high-performance flooring for offices, restaurants, retail spaces, and other commercial environments.
          </p>
          
          {/* Commercial Project with Before/After */}
          <BeforeAfterProject project={commercialProjects[0]} />
          
          <div className="mt-10 flex justify-center">
            <Link
              href="/projects?category=commercial"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all duration-300 shadow-md hover:shadow-xl"
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