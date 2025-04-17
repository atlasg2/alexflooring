export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  image: string;
  source: 'Google' | 'Yelp' | 'Facebook';
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Jennifer R.",
    location: "New Orleans, LA",
    quote: "APS Flooring completely transformed our home with beautiful hardwood floors. The team was professional, on time, and left our space cleaner than when they started. Highly recommend!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/54.jpg",
    source: "Google"
  },
  {
    id: "2",
    name: "Michael T.",
    location: "Birmingham, AL",
    quote: "We had LVP installed throughout our first floor. The crew was incredible - fast, clean, and the floors look amazing. Alex was very knowledgeable and helped us pick the perfect style.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    source: "Google"
  },
  {
    id: "3",
    name: "Sarah M.",
    location: "Metairie, LA",
    quote: "I can't say enough good things about APS Flooring. They refinished our 80-year-old hardwood floors, and they look brand new. Great attention to detail and excellent customer service.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/67.jpg",
    source: "Yelp"
  },
  {
    id: "4",
    name: "David W.",
    location: "Hoover, AL",
    quote: "Professional, punctual, and perfect work. My new bathroom shower tile is exactly what I wanted. They were clean, respectful of my home, and completed the job on schedule.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/82.jpg",
    source: "Google"
  },
  {
    id: "5",
    name: "Amanda J.",
    location: "Chalmette, LA",
    quote: "After getting quotes from several companies, I chose APS for their fair pricing and great reviews. They didn't disappoint! My new hardwood floors are stunning and the work was completed faster than expected.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/15.jpg",
    source: "Facebook"
  }
];
