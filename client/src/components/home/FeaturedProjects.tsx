
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { MapPin } from "lucide-react";

// Select just 2 featured projects
const featuredProjects = projects.slice(0, 2);

const FeaturedProjects = () => {
  return (
    <section id="projects" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary relative inline-block">
            Featured Projects
            <span className="absolute -bottom-3 left-1/2 w-24 h-1 bg-secondary transform -translate-x-1/2"></span>
          </h2>
          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            See the transformation in our recent flooring installations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-16">
          {featuredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-xl">
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
                  <div className="absolute top-0 bottom-0 w-px bg-white right-0 z-30"></div>
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
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm">
                    {project.type}
                  </span>
                  <span className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1 text-secondary" /> 
                    {project.location}
                  </span>
                  
                  {project.testimonial && (
                    <div className="w-full mt-4 italic text-gray-600 border-l-4 border-secondary pl-4 py-2 bg-gray-50">
                      "{project.testimonial.substring(0, 120)}..."
                      {project.clientName && <span className="block mt-1 font-medium text-gray-700">— {project.clientName}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button 
            asChild
            className="bg-primary text-white hover:bg-primary/80 py-6 px-10 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <Link href="/projects" className="flex items-center gap-2">
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
