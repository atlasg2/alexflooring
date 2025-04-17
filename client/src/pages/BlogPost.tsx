import { Helmet } from "react-helmet-async";
import { useParams, useLocation, Link } from "wouter";
import { blogPosts } from "@/data/blogPosts";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, ChevronLeft, ChevronRight } from "lucide-react";
import CTABanner from "@/components/home/CTABanner";

const BlogPost = () => {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  
  const post = blogPosts.find(p => p.slug === slug);
  
  // If post not found, redirect to 404
  if (!post) {
    setLocation("/not-found");
    return null;
  }
  
  // Find next and previous posts for navigation
  const currentIndex = blogPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <>
      <Helmet>
        <title>{`${post.title} - APS Flooring LLC`}</title>
        <meta name="description" content={post.metaDescription} />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url(${post.image})` }}
        >
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <Badge className="bg-secondary hover:bg-secondary/80 mb-4">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" />
                <span>{formatDate(post.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Blog Article */}
            <article className="prose lg:prose-xl mx-auto">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
            
            {/* Post Navigation */}
            <div className="mt-16 flex flex-col sm:flex-row justify-between border-t border-gray-200 pt-8">
              {prevPost ? (
                <Link 
                  href={`/blog/${prevPost.slug}`}
                  className="flex items-center text-primary hover:text-primary/80 mb-4 sm:mb-0"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  <span className="text-sm">Previous Post</span>
                </Link>
              ) : (
                <div></div>
              )}
              
              <Link 
                href="/blog"
                className="text-center text-primary hover:text-primary/80"
              >
                All Posts
              </Link>
              
              {nextPost ? (
                <Link 
                  href={`/blog/${nextPost.slug}`}
                  className="flex items-center text-primary hover:text-primary/80"
                >
                  <span className="text-sm">Next Post</span>
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              ) : (
                <div></div>
              )}
            </div>
            
            {/* Related Posts */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-primary mb-8">Related Posts</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts
                  .filter(p => p.id !== post.id && p.category === post.category)
                  .slice(0, 2)
                  .map(relatedPost => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="block group">
                      <div className="bg-gray-100 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
                        <div 
                          className="h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${relatedPost.image})` }}
                        ></div>
                        <div className="p-4">
                          <Badge className="bg-secondary hover:bg-secondary/80 mb-2">
                            {relatedPost.category}
                          </Badge>
                          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{relatedPost.author}</span>
                            <span>{formatDate(relatedPost.date)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
              
              {/* If no related posts by category */}
              {blogPosts.filter(p => p.id !== post.id && p.category === post.category).length === 0 && (
                <div className="grid md:grid-cols-2 gap-8">
                  {blogPosts
                    .filter(p => p.id !== post.id)
                    .slice(0, 2)
                    .map(relatedPost => (
                      <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="block group">
                        <div className="bg-gray-100 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
                          <div 
                            className="h-40 bg-cover bg-center"
                            style={{ backgroundImage: `url(${relatedPost.image})` }}
                          ></div>
                          <div className="p-4">
                            <Badge className="bg-secondary hover:bg-secondary/80 mb-2">
                              {relatedPost.category}
                            </Badge>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                              {relatedPost.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{relatedPost.author}</span>
                              <span>{formatDate(relatedPost.date)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
};

export default BlogPost;
