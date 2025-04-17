import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BeforeAfterSlider from "@/components/ui/before-after-slider";
import { projects } from "@/data/projects";

// Select just 2 featured projects
const featuredProjects = projects.slice(0, 2);

const FeaturedProjects = () => {
  return (
    <section id="projects" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-primary">Featured Projects</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See the transformation in our recent flooring installations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {featuredProjects.map((project) => (
            <div key={project.id} className="rounded-xl overflow-hidden shadow-xl">
              <BeforeAfterSlider
                beforeImage={project.beforeImage}
                afterImage={project.afterImage}
                beforeAlt={`Before: ${project.title}`}
                afterAlt={`After: ${project.title}`}
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <div className="flex items-center mt-4">
                  <span className="text-sm bg-primary text-white py-1 px-3 rounded-full">
                    {project.type}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">{project.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            asChild
            className="bg-primary text-white hover:bg-primary/90 py-3 px-8 rounded-lg text-lg"
          >
            <Link href="/projects">View Full Portfolio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
