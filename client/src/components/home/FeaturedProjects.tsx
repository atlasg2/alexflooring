
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { MapPin, Home, Store, ArrowRight } from "lucide-react";

// Filter projects by category
const residentialProjects = projects.filter(project => project.category === 'residential');
const commercialProjects = projects.filter(project => project.category === 'commercial');

// Get one project from each category for featured display
const featuredResidentialProject = residentialProjects[0];
const featuredCommercialProject = commercialProjects[0];

const ProjectCard = ({ project }: { project: typeof projects[0] }) => (
  <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
    <div className="grid md:grid-cols-2 gap-0">
      <div className="relative overflow-hidden h-80 cursor-ew-resize border-r border-white group">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
          style={{ backgroundImage: `url(${project.beforeImage})` }}
        >
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">Before</span>
          </div>
        </div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-secondary right-0 z-30"></div>
      </div>
      
      <div className="relative overflow-hidden h-80 cursor-ew-resize group">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
          style={{ backgroundImage: `url(${project.afterImage})` }}
        >
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">After</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-8 border-t-4 border-secondary">
      <h3 className="text-2xl font-bold text-primary mb-3">{project.title}</h3>
      <p className="text-gray-600 mb-4">{project.description}</p>
      
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <span className="px-4 py-2 bg-gray-100 text-primary rounded-full font-medium text-sm">
          {project.type}
        </span>
        <span className="flex items-center text-gray-500">
          <MapPin className="h-4 w-4 mr-1 text-secondary" /> 
          {project.location}
        </span>
        
        {project.testimonial && (
          <div className="w-full mt-4 italic text-gray-600 border-l-4 border-secondary pl-4 py-3 bg-gray-50">
            "{project.testimonial.substring(0, 120)}..."
            {project.clientName && <span className="block mt-1 font-medium text-primary">— {project.clientName}</span>}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Residential projects - showing a grid of projects
const ResidentialProjects = ({ 
  projects,
  icon, 
  bgColor = "bg-white"
}: { 
  projects: typeof import("@/data/projects").projects; 
  icon: React.ReactNode;
  bgColor?: string;
}) => (
  <div className={`py-16 ${bgColor}`}>
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-center mb-10 gap-4">
        <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative">
          Residential Projects
          <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
        </h2>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
        Premium flooring solutions for homes, from hardwood installations to bathroom remodels and floor refinishing.
      </p>
      
      {/* Show top 2 residential projects in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {projects.slice(0, 2).map(project => (
          <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Before/After Image */}
            <div className="relative h-64 overflow-hidden">
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${project.afterImage})` }}
              />
              <div className="absolute top-4 right-4 bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {project.type}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
              <div className="flex items-center text-gray-500 mb-3">
                <MapPin className="h-4 w-4 mr-1 text-secondary" /> 
                {project.location}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              <Link 
                href={`/projects/${project.id}`}
                className="inline-flex items-center text-secondary font-medium hover:text-primary transition-colors duration-300 hover:underline"
              >
                View Project <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link 
          href="/projects?category=residential"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          View All Residential Projects
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  </div>
);

// Commercial projects - showing a single featured project
const CommercialProjects = ({ 
  project,
  icon, 
  bgColor = "bg-white"
}: { 
  project: typeof import("@/data/projects").projects[0]; 
  icon: React.ReactNode;
  bgColor?: string;
}) => (
  <div className={`py-16 ${bgColor}`}>
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-center mb-10 gap-4">
        <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative">
          Commercial Projects
          <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
        </h2>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
        Long-lasting, high-performance flooring for offices, restaurants, retail spaces, and other commercial environments.
      </p>
      
      {/* Show featured commercial project with before/after comparison */}
      <ProjectCard project={project} />

      <div className="text-center mt-10">
        <Link 
          href="/projects?category=commercial"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          View All Commercial Projects
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  </div>
);

const FeaturedProjects = () => {
  return (
    <section id="projects">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative inline-block">
            Our Projects
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            See the transformation in our recent flooring installations.
          </p>
        </div>
      </div>
      
      {/* Grid layout for residential projects */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-10 gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative">
              Residential Projects
              <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
            Premium flooring solutions for homes, from hardwood installations to bathroom remodels and floor refinishing.
          </p>
          
          {/* Show top 2 residential projects in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {residentialProjects.slice(0, 2).map(project => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 group">
                {/* Before/After Image */}
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${project.afterImage})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {project.type}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <div className="flex items-center text-white/80 text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-secondary" /> 
                      {project.location}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 border-t-4 border-secondary">
                  <p className="text-gray-600 mb-5">{project.description.substring(0, 120)}...</p>
                  
                  <Link 
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center text-secondary font-medium hover:text-primary transition-colors duration-300 hover:underline"
                  >
                    View Project <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link 
              href="/projects?category=residential"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              View All Residential Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Before/after layout for commercial project */}
      <div className="py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-10 gap-4">
            <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative">
              Commercial Projects
              <span className="absolute -bottom-3 left-0 w-24 h-1 bg-secondary"></span>
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-12">
            Long-lasting, high-performance flooring for offices, restaurants, retail spaces, and other commercial environments.
          </p>
          
          {/* Show featured commercial project with before/after comparison */}
          <ProjectCard project={featuredCommercialProject} />

          <div className="text-center mt-10">
            <Link 
              href="/projects?category=commercial"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              View All Commercial Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-2xl opacity-30 rounded-full transform scale-150"></div>
          <Button 
            asChild
            className="bg-primary hover:bg-primary/90 text-white py-6 px-12 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative"
          >
            <Link href="/projects" className="flex items-center gap-3">
              View Full Portfolio
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
