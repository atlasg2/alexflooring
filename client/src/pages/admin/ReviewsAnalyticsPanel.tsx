import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { allReviews } from '@/data/allReviews';
import GoogleMapWithPins from '@/components/ui/google-map-pins';
import MapEmbed from '@/components/ui/map-embed';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

// Type for review metrics
type ReviewMetrics = {
  totalReviews: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
  timeRanges: {
    lastMonth: number;
    last3Months: number;
    last6Months: number;
    lastYear: number;
  };
};

// Compute metrics from the reviews data
const computeMetrics = (reviews: typeof allReviews): ReviewMetrics => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const metrics: ReviewMetrics = {
    totalReviews: reviews.length,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    timeRanges: {
      lastMonth: 0,
      last3Months: 0,
      last6Months: 0,
      lastYear: 0
    }
  };

  let ratingSum = 0;

  reviews.forEach(review => {
    // Count by rating
    const rating = review.rating || 5;
    metrics.ratingCounts[rating] = (metrics.ratingCounts[rating] || 0) + 1;
    ratingSum += rating;

    // Count by time range
    if (review.date) {
      const reviewDate = new Date(review.date);
      
      if (reviewDate >= oneMonthAgo) {
        metrics.timeRanges.lastMonth++;
      }
      
      if (reviewDate >= threeMonthsAgo) {
        metrics.timeRanges.last3Months++;
      }
      
      if (reviewDate >= sixMonthsAgo) {
        metrics.timeRanges.last6Months++;
      }
      
      if (reviewDate >= oneYearAgo) {
        metrics.timeRanges.lastYear++;
      }
    }
  });

  // Calculate average rating
  metrics.averageRating = reviews.length > 0 ? parseFloat((ratingSum / reviews.length).toFixed(1)) : 0;

  return metrics;
};

const ReviewsAnalyticsPanel = () => {
  // For navigation
  const [, navigate] = useLocation();
  
  // Calculate metrics
  const metrics = computeMetrics(allReviews);
  
  // Prepare data for charts
  const ratingData = Object.entries(metrics.ratingCounts).map(([rating, count]) => ({
    rating: `${rating} Star${Number(rating) !== 1 ? 's' : ''}`,
    count: count
  }));
  
  const timeRangeData = [
    { name: 'Last Month', reviews: metrics.timeRanges.lastMonth },
    { name: 'Last 3 Months', reviews: metrics.timeRanges.last3Months },
    { name: 'Last 6 Months', reviews: metrics.timeRanges.last6Months },
    { name: 'Last Year', reviews: metrics.timeRanges.lastYear }
  ];
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // For map view
  const DEFAULT_LOCATION = {
    address: "3507 Meadow Park Ln, New Orleans, LA 70131",
    city: "New Orleans, LA"
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-8">
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-2xl font-bold">5-Star Google Reviews Analytics</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/reviews')}
          className="mt-2 sm:mt-0"
        >
          View All Reviews <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-1">Total Reviews</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalReviews}</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-1">Average Rating</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.averageRating} ⭐</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-1">5-Star Reviews</h3>
          <p className="text-3xl font-bold text-purple-600">
            {metrics.ratingCounts[5]}
            <span className="text-sm font-normal ml-1">
              ({Math.round((metrics.ratingCounts[5] / metrics.totalReviews) * 100)}%)
            </span>
          </p>
        </div>
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating distribution chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="rating"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {ratingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} reviews`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Time range chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Reviews Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={timeRangeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value} reviews`, 'Count']} />
              <Legend />
              <Bar dataKey="reviews" fill="#8884d8" name="Reviews" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Review locations map */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Review Locations</h3>
        <div className="h-[400px] w-full">
          {/* Show interactive map with pins for all review locations */}
          <GoogleMapWithPins 
            reviews={allReviews}
            height="400px"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          Map shows all review locations. Green = 5★, Blue = 4★, Yellow = 3★, Red = 1-2★. Click pins for details.
        </p>
      </div>
    </div>
  );
};

export default ReviewsAnalyticsPanel;