import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { projects } from "@/data/projects";
import BeforeAfterSlider from "@/components/ui/before-after-slider";
import CTABanner from "@/components/home/CTABanner";

// Get unique project types for filtering
const projectTypes = ["All", ...Array.from(new Set(projects.map(project => project.type)))];

const Projects = () => {
  const [filter, setFilter] = useState("All");
  
  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter(project => project.type === filter);

  return (
    <>
      <Helmet>
        <title>Our Projects - APS Flooring LLC</title>
        <meta name="description" content="Browse our portfolio of flooring projects in Louisiana and Alabama. See before and after transformations of hardwood, luxury vinyl, tile, and commercial flooring installations." />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)" }}>
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Project Portfolio</h1>
            <p className="text-lg md:text-xl">
              Browse through our beautiful flooring transformations across Louisiana and Alabama.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Controls */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {projectTypes.map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full ${
                  filter === type 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                } transition duration-300`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {filteredProjects.map(project => (
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
                  
                  {project.testimonial && (
                    <blockquote className="italic text-gray-700 mt-4 border-l-4 border-primary pl-4 py-2">
                      "{project.testimonial}"
                      {project.clientName && <footer className="text-gray-500 text-sm mt-1">— {project.clientName}</footer>}
                    </blockquote>
                  )}
                  
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
          
          {/* Show message if no projects match filter */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No projects found</h3>
              <p className="text-gray-600">Please try a different filter or check back later.</p>
            </div>
          )}
        </div>
      </section>

      <CTABanner />
    </>
  );
};

export default Projects;
