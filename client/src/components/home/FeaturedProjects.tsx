import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BeforeAfterSlider from "@/components/ui/before-after-slider";
import { projects } from "@/data/projects";

// Select just 2 featured projects
const featuredProjects = projects.slice(0, 2);

const FeaturedProjects = () => {
  return (
    <section id="projects" className="py-20 bg-gradient-to-b from-white to-accent/30">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {featuredProjects.map((project) => (
            <div key={project.id} className="rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
              <BeforeAfterSlider
                beforeImage={project.beforeImage}
                afterImage={project.afterImage}
                beforeAlt={`Before: ${project.title}`}
                afterAlt={`After: ${project.title}`}
              />
              <div className="p-6 bg-white border-t-4 border-secondary">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <div className="flex items-center mt-4">
                  <span className="text-sm bg-primary text-white py-1 px-3 rounded-full shadow-sm">
                    {project.type}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-secondary" /> 
                    {project.location}
                  </span>
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
