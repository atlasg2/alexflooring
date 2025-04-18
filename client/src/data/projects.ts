export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  beforeImage: string;
  afterImage: string;
  testimonial?: string;
  clientName?: string;
  category: 'residential' | 'commercial';
  tags: string[];
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Hardwood Transformation",
    description: "Replaced old carpet with premium oak hardwood in this New Orleans living room.",
    location: "New Orleans, LA",
    type: "Hardwood",
    beforeImage: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1591465709840-2c91ab42fc75?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "We couldn't be happier with our new hardwood floors. The transformation is incredible, and the installation was smooth and professional.",
    clientName: "Williams Family",
    category: "residential",
    tags: ["hardwood", "living room", "new construction"]
  },
  {
    id: "2",
    title: "Kitchen Renovation",
    description: "Upgraded to waterproof luxury vinyl plank in this Metairie family kitchen.",
    location: "Metairie, LA",
    type: "Luxury Vinyl",
    beforeImage: "https://images.unsplash.com/photo-1517176821879-0f1478c0d082?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "The luxury vinyl is perfect for our busy kitchen. It looks like real wood but stands up to spills and our pets much better. Great recommendation by the APS team!",
    clientName: "Thompson Family",
    category: "residential",
    tags: ["lvp", "kitchen", "renovation"]
  },
  {
    id: "3",
    title: "Master Bathroom Remodel",
    description: "Custom tile installation in shower and floors for this elegant master bathroom.",
    location: "Metairie, LA",
    type: "Tile",
    beforeImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1584622650111-993a426bcf0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "Our new master bathroom is a spa-like retreat! The tile work is absolutely gorgeous, and every detail was carefully handled.",
    clientName: "Johnson Residence",
    category: "residential",
    tags: ["tile", "bathroom", "remodel"]
  },
  {
    id: "4",
    title: "Office Flooring Solution",
    description: "Commercial-grade luxury vinyl tile for this professional office space in New Orleans.",
    location: "New Orleans, LA",
    type: "Commercial",
    beforeImage: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "APS made our office renovation painless with minimal disruption to our business. The floors are both beautiful and durable.",
    clientName: "Smith Consulting Group",
    category: "commercial",
    tags: ["lvp", "office", "commercial"]
  },
  {
    id: "5",
    title: "Hardwood Floor Refinishing",
    description: "Restored these century-old oak floors to their original beauty in a historic New Orleans home.",
    location: "New Orleans, LA",
    type: "Refinishing",
    beforeImage: "https://images.unsplash.com/photo-1582643381669-3300872ca92e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "We're amazed at how our old floors turned out. The APS team took great care with our historic home and brought these original floors back to life.",
    clientName: "Historic Garden District Home",
    category: "residential",
    tags: ["hardwood", "refinishing", "historic"]
  },
  {
    id: "6",
    title: "Restaurant Floor Installation",
    description: "Durable commercial tile for this busy local restaurant in the French Quarter.",
    location: "New Orleans, LA",
    type: "Commercial",
    beforeImage: "https://images.unsplash.com/photo-1512817307808-b1684be9e197?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "The floor had to withstand heavy foot traffic and frequent cleaning. APS recommended the perfect solution and installed it on our tight timeline.",
    clientName: "Local Bistro",
    category: "commercial",
    tags: ["tile", "restaurant", "commercial"]
  },
  {
    id: "7",
    title: "Luxury Home Entryway",
    description: "Premium marble tile installation in this grand entryway of a luxury Uptown residence.",
    location: "New Orleans, LA",
    type: "Tile",
    beforeImage: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "The marble entryway makes the perfect first impression for our home. The craftsmanship and attention to detail exceeded our expectations.",
    clientName: "Roberts Residence",
    category: "residential",
    tags: ["tile", "marble", "entryway", "luxury"]
  },
  {
    id: "8",
    title: "Boutique Retail Store",
    description: "Modern luxury vinyl plank flooring for this upscale clothing boutique on Magazine Street.",
    location: "New Orleans, LA",
    type: "LVP",
    beforeImage: "https://images.unsplash.com/photo-1580976592269-dad6e481f6fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "The floors perfectly complement our store's aesthetic while standing up to the demands of retail traffic. Easy to maintain and always looks great.",
    clientName: "Chic Boutique",
    category: "commercial",
    tags: ["lvp", "retail", "commercial"]
  },
  {
    id: "9",
    title: "Lakefront Home Renovation",
    description: "Complete flooring renovation including hardwood, tile, and carpet for this lakefront property.",
    location: "Mandeville, LA",
    type: "Multi-surface",
    beforeImage: "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    testimonial: "Our whole-home flooring project turned out beautifully. APS helped us select the perfect materials for each room and coordinated everything seamlessly.",
    clientName: "Martinez Family",
    category: "residential",
    tags: ["hardwood", "tile", "carpet", "whole-home"]
  }
];