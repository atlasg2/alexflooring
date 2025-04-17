export interface LocationTestimonial {
  name: string;
  quote: string;
  neighborhood: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  state: string;
  image: string;
  address: string;
  phone: string;
  phoneDisplay: string;
  areas: string[];
  testimonials: LocationTestimonial[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const locations: Location[] = [
  {
    id: "1",
    name: "Birmingham",
    slug: "birmingham",
    state: "Alabama",
    image: "https://images.unsplash.com/photo-1578597060071-42e0d24f2593?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    address: "456 Oak Street",
    phone: "2055555678",
    phoneDisplay: "(205) 555-5678",
    areas: [
      "Birmingham",
      "Hoover",
      "Vestavia Hills",
      "Mountain Brook",
      "Homewood",
      "Trussville"
    ],
    testimonials: [
      {
        name: "Michael T.",
        quote: "We had LVP installed throughout our first floor. The crew was incredible - fast, clean, and the floors look amazing. Alex was very knowledgeable and helped us pick the perfect style.",
        neighborhood: "Hoover"
      },
      {
        name: "David W.",
        quote: "Professional, punctual, and perfect work. My new bathroom shower tile is exactly what I wanted. They were clean, respectful of my home, and completed the job on schedule.",
        neighborhood: "Vestavia Hills"
      }
    ],
    coordinates: {
      lat: 33.5186,
      lng: -86.8104
    }
  },
  {
    id: "2",
    name: "New Orleans",
    slug: "new-orleans",
    state: "Louisiana",
    image: "https://images.unsplash.com/photo-1571893544028-06b07af6dade?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    address: "123 Flooring Way",
    phone: "5045551234",
    phoneDisplay: "(504) 555-1234",
    areas: [
      "New Orleans",
      "Metairie",
      "Kenner",
      "Chalmette",
      "Slidell",
      "Gretna"
    ],
    testimonials: [
      {
        name: "Jennifer R.",
        quote: "APS Flooring completely transformed our home with beautiful hardwood floors. The team was professional, on time, and left our space cleaner than when they started. Highly recommend!",
        neighborhood: "Garden District"
      },
      {
        name: "Sarah M.",
        quote: "I can't say enough good things about APS Flooring. They refinished our 80-year-old hardwood floors, and they look brand new. Great attention to detail and excellent customer service.",
        neighborhood: "Metairie"
      }
    ],
    coordinates: {
      lat: 29.9511,
      lng: -90.0715
    }
  }
];
