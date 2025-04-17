import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { blogPosts } from "@/data/blogPosts";
import { formatDate, truncateText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User } from "lucide-react";
import CTABanner from "@/components/home/CTABanner";

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Flooring Blog - APS Flooring LLC</title>
        <meta name="description" content="Expert tips, trends, and advice on flooring options, installation, and maintenance from APS Flooring professionals." />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1603969409447-ba86143a03f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)" }}>
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Flooring Blog</h1>
            <p className="text-lg md:text-xl">
              Expert tips, trends, and advice on flooring from our professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Featured Post */}
            {blogPosts.length > 0 && (
              <div className="mb-16">
                <Link href={`/blog/${blogPosts[0].slug}`} className="block">
                  <div className="group grid md:grid-cols-2 gap-8 items-center">
                    <div 
                      className="h-64 bg-cover bg-center rounded-lg overflow-hidden"
                      style={{ backgroundImage: `url(${blogPosts[0].image})` }}
                    ></div>
                    <div>
                      <Badge className="bg-secondary hover:bg-secondary/80 mb-4">
                        {blogPosts[0].category}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                        {blogPosts[0].title}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {blogPosts[0].excerpt}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span className="mr-4">{blogPosts[0].author}</span>
                        <CalendarDays className="h-4 w-4 mr-1" />
                        <span>{formatDate(blogPosts[0].date)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            
            {/* Rest of Blog Posts */}
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.slice(1).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                  <div className="bg-gray-100 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
                    <div 
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.image})` }}
                    ></div>
                    <div className="p-6">
                      <Badge className="bg-secondary hover:bg-secondary/80 mb-2">
                        {post.category}
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {truncateText(post.excerpt, 120)}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <CalendarDays className="h-4 w-4 mr-1" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* No Posts Found */}
            {blogPosts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No blog posts found</h3>
                <p className="text-gray-600">Check back soon for new content.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
};

export default Blog;
