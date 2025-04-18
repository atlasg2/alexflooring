import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { allReviews } from '@/data/allReviews';
import { Star, Calendar, MapPin, ExternalLink, Mail, Filter } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import ReviewsAnalyticsPanel from './ReviewsAnalyticsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import GoogleMapWithPins from '@/components/ui/google-map-pins';

const ReviewsPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [displayedReviews, setDisplayedReviews] = useState(allReviews);
  
  // Sort reviews by date (newest first)
  useEffect(() => {
    const sorted = [...allReviews].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setDisplayedReviews(sorted);
  }, []);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  // Group reviews by month for the timeline view
  const groupedReviews = displayedReviews.reduce((groups: Record<string, typeof allReviews>, review) => {
    if (!review.date) return groups;
    
    const date = new Date(review.date);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    if (!groups[monthName]) {
      groups[monthName] = [];
    }
    
    groups[monthName].push(review);
    return groups;
  }, {});
  
  // Get rating counts
  const ratingCounts = allReviews.reduce((counts: Record<number, number>, review) => {
    counts[review.rating] = (counts[review.rating] || 0) + 1;
    return counts;
  }, {});

  return (
    <AdminLayout title="5-Star Google Reviews">
      {/* Analytics Panel */}
      <div className="mb-6">
        <ReviewsAnalyticsPanel />
      </div>
      
      {/* Reviews summary header */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            <span className="font-medium">All Reviews:</span>
            <Badge variant="outline" className="ml-2 flex items-center gap-1">
              Total: 24 reviews
            </Badge>
            <Badge variant="outline" className="ml-2 flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
              5 ★: 24
            </Badge>
          </div>
          
          <div>
            <Button variant="default" size="sm">
              Request More Reviews <Mail className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="map">Map with Pins</TabsTrigger>
        </TabsList>
        
        {/* List View */}
        <TabsContent value="list">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                All Google Reviews ({displayedReviews.length})
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://www.google.com/maps?cid=10869331333221622596', '_blank')}
              >
                View on Google Maps <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            {displayedReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews found matching your filters.
              </div>
            ) : (
              <div className="space-y-6">
                {displayedReviews.map((review, index) => {
                  // All reviews are 5-star
                  const ratingColor = "text-green-500";
                  
                  return (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-full h-12 w-12 flex items-center justify-center font-medium shrink-0 bg-green-100 text-green-700">
                          {getInitials(review.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-lg">{review.name}</h3>
                            <div className={`flex ${ratingColor}`}>
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                              {[...Array(5 - review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-gray-300" />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(review.date || '')}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{review.location}</span>
                            </div>
                          </div>
                          
                          <p className="mt-3 text-gray-700">"{review.quote}"</p>
                          
                          {review.latitude && review.longitude && (
                            <div className="mt-2 text-xs text-gray-400">
                              Location: {review.latitude}, {review.longitude}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Timeline View */}
        <TabsContent value="timeline">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">
              Reviews Timeline
            </h2>
            
            {Object.keys(groupedReviews).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews found matching your filters.
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedReviews)
                  .sort(([monthA], [monthB]) => new Date(monthB).getTime() - new Date(monthA).getTime())
                  .map(([month, reviews]) => (
                  <div key={month} className="relative">
                    <h3 className="text-lg font-medium sticky top-0 bg-white py-2">{month}</h3>
                    
                    <div className="ml-4 border-l-2 border-gray-200 pl-6 space-y-6 pt-2">
                      {reviews.map((review, index) => {
                        // All reviews are 5-star
                        const timelineDotColor = "bg-green-500";
                        
                        return (
                          <div key={index} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-9 top-0 w-4 h-4 rounded-full ${timelineDotColor}`}></div>
                            
                            <div className="border rounded-lg p-4 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="rounded-full h-10 w-10 flex items-center justify-center font-medium shrink-0 bg-green-100 text-green-700">
                                  {getInitials(review.name)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-semibold">{review.name}</h4>
                                    <div className="flex text-yellow-400">
                                      {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-current" />
                                      ))}
                                      {[...Array(5 - review.rating)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 text-gray-300" />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500">{formatDate(review.date || '')}</span>
                                  </div>
                                  <p className="mt-2 text-gray-700">"{review.quote}"</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Map with Pins View */}
        <TabsContent value="map">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">
              Reviews Map
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              All 5-star reviews are shown as green pins on the map. Click pins to see details.
            </p>
            
            {/* Interactive Google Map with pins */}
            <div className="mb-6">
              <GoogleMapWithPins reviews={displayedReviews} />
            </div>
            
            {/* Map legend */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>5-Star Reviews</span>
              </div>
            </div>
            
            {/* Reviews list under map */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedReviews.slice(0, 9).map((review, index) => {
                // All reviews are 5-star
                const avatarColor = "bg-green-100 text-green-700";
                
                return (
                  <div key={index} className="border rounded-lg p-3 shadow-sm text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center font-medium text-xs ${avatarColor}`}>
                        {getInitials(review.name)}
                      </div>
                      <div>
                        <div className="font-medium">{review.name}</div>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-gray-300" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-gray-700 text-xs">"{review.quote}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default ReviewsPage;