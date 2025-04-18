export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  image: string;
  slug: string;
  metaDescription: string;
  category: 'residential' | 'commercial';
  features?: string[];
  beforeImage?: string;
  afterImage?: string;
  description?: string;
}

export const services: Service[] = [
  {
    id: "1",
    title: "Hardwood Installation",
    shortDescription: "Premium hardwood floor installation, sanding, and finishing.",
    fullDescription: `
      <p>Our premium hardwood flooring installation service combines craftsmanship with quality materials to create stunning, long-lasting hardwood floors that elevate your home's beauty and value.</p>
      
      <h3>Why Choose Hardwood Flooring?</h3>
      <p>Hardwood floors offer timeless beauty, durability, and improved indoor air quality. They're an excellent investment that increases your home's value and can last for generations with proper care.</p>
      
      <h3>Our Installation Process</h3>
      <p>Our skilled technicians follow a meticulous process:</p>
      <ul>
        <li>In-home consultation and accurate measurements</li>
        <li>Removal and disposal of existing flooring</li>
        <li>Subfloor preparation and repair</li>
        <li>Precision installation using quality materials</li>
        <li>Sanding to create a perfectly smooth surface</li>
        <li>Application of stain in your chosen color</li>
        <li>Multiple coats of durable finish</li>
        <li>Final inspection and cleanup</li>
      </ul>
      
      <h3>Wood Species We Offer</h3>
      <p>We install a variety of hardwood species including Oak, Maple, Hickory, Walnut, and exotic options. Each species offers unique grain patterns, colors, and hardness levels to match your style and usage needs.</p>
      
      <h3>Finishing Options</h3>
      <p>Choose from various finishes including matte, satin, semi-gloss, or high-gloss. We also offer custom staining to achieve the exact color and look you desire.</p>
      
      <h3>Maintenance and Care</h3>
      <p>We'll provide detailed instructions on how to maintain your new hardwood floors to ensure they remain beautiful for years to come.</p>
    `,
    icon: "Layers",
    image: "https://images.unsplash.com/photo-1584285405450-dff1bffc5eb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "hardwood",
    metaDescription: "Professional hardwood floor installation, sanding, and finishing services in Louisiana and Alabama. Premium materials, expert craftsmanship.",
    category: "residential",
    description: "Our premium hardwood flooring installation service combines craftsmanship with quality materials to create stunning, long-lasting hardwood floors that elevate your home's beauty and value.",
    features: [
      "Wide selection of premium hardwood species including Oak, Maple, and Walnut",
      "Custom staining and finishing options to match your decor",
      "Expert installation with meticulous attention to detail",
      "50+ year lifespan with proper maintenance"
    ],
    beforeImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1584285405450-dff1bffc5eb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    title: "Luxury Vinyl Plank",
    shortDescription: "Durable, water-resistant vinyl plank for any room.",
    fullDescription: `
      <p>Luxury Vinyl Plank (LVP) flooring offers the perfect combination of beauty, durability, and practicality for today's busy households.</p>
      
      <h3>Benefits of Luxury Vinyl Plank</h3>
      <p>LVP provides the look of hardwood with enhanced benefits:</p>
      <ul>
        <li>100% waterproof - perfect for bathrooms, kitchens, and basements</li>
        <li>Highly resistant to scratches, dents, and stains</li>
        <li>Comfortable underfoot and warmer than tile</li>
        <li>Easy to clean and maintain</li>
        <li>Quick installation with minimal disruption</li>
        <li>Available in a wide range of wood-look styles</li>
      </ul>
      
      <h3>Our LVP Installation Process</h3>
      <p>Our professional installation ensures your new floors will look beautiful and perform flawlessly:</p>
      <ul>
        <li>Surface preparation to ensure a smooth, level base</li>
        <li>Precision cutting for perfect fits around edges and obstacles</li>
        <li>Expert installation using the appropriate method (floating, glue-down, or click-lock)</li>
        <li>Proper acclimation of materials before installation</li>
        <li>Careful attention to expansion gaps and transitions</li>
        <li>Complete cleanup and removal of all debris</li>
      </ul>
      
      <h3>Quality Products</h3>
      <p>We only use premium LVP products from trusted manufacturers that offer excellent warranties and performance. Our luxury vinyl comes in various thicknesses and wear layer options to suit your specific needs.</p>
      
      <h3>Perfect for Any Room</h3>
      <p>LVP is an ideal flooring solution for bathrooms, kitchens, basements, living rooms, and throughout your entire home. Its waterproof nature and durability make it perfect for families with children and pets.</p>
    `,
    icon: "Layers",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "lvp",
    metaDescription: "Professional luxury vinyl plank installation in Louisiana and Alabama. Waterproof, durable flooring solutions for kitchens, bathrooms, and throughout your home.",
    category: "residential",
    description: "Luxury Vinyl Plank (LVP) flooring offers the perfect combination of beauty, durability, and practicality for today's busy households, with 100% waterproof performance and scratch resistance.",
    features: [
      "100% waterproof - ideal for bathrooms, kitchens, and basements",
      "Superior scratch and dent resistance for homes with kids and pets",
      "Wide variety of wood-look finishes and textures",
      "Quick installation with minimal disruption to your home"
    ],
    beforeImage: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    title: "Floor Refinishing",
    shortDescription: "Restore the beauty of your worn hardwood floors.",
    fullDescription: `
      <p>Our professional hardwood floor refinishing service brings new life to your existing hardwood floors, restoring their beauty and extending their lifespan.</p>
      
      <h3>When to Refinish Your Floors</h3>
      <p>Consider refinishing when your hardwood floors show these signs:</p>
      <ul>
        <li>Visible scratches, dents, or gouges</li>
        <li>Dull appearance despite regular cleaning</li>
        <li>Gray or black discoloration</li>
        <li>Water damage or stains</li>
        <li>Fading from sun exposure</li>
        <li>Uneven color or finish</li>
      </ul>
      
      <h3>Our Refinishing Process</h3>
      <p>Our comprehensive refinishing process includes:</p>
      <ul>
        <li>Initial assessment and protection of surrounding areas</li>
        <li>Removal of old finish with professional-grade sanders</li>
        <li>Progressive sanding with increasingly finer grits</li>
        <li>Filling of gaps, cracks, and imperfections</li>
        <li>Stain application in your chosen color (optional)</li>
        <li>Multiple coats of premium polyurethane finish</li>
        <li>Light buffing between coats for a flawless result</li>
        <li>Final inspection and thorough cleanup</li>
      </ul>
      
      <h3>Refinishing vs. Replacement</h3>
      <p>Refinishing is a cost-effective alternative to complete replacement, typically costing 1/3 to 1/2 the price of new floors. Most hardwood floors can be refinished multiple times throughout their lifetime.</p>
      
      <h3>Customization Options</h3>
      <p>Refinishing provides an opportunity to change the look of your floors:</p>
      <ul>
        <li>Change the stain color (lighter or darker)</li>
        <li>Alter the sheen level (matte to high-gloss)</li>
        <li>Add texture with techniques like wire-brushing</li>
        <li>Change your finish type for different durability levels</li>
      </ul>
      
      <h3>Minimal Disruption</h3>
      <p>While refinishing requires you to vacate the space during the process, our efficient team typically completes projects within 3-5 days, minimizing disruption to your household.</p>
    `,
    icon: "Brush",
    image: "https://images.unsplash.com/photo-1581782250144-25fdb783c355?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "refinishing",
    metaDescription: "Professional hardwood floor refinishing in Louisiana and Alabama. Restore your worn hardwood floors to like-new condition with our expert refinishing services.",
    category: "residential",
    description: "Our hardwood floor refinishing service breathes new life into tired, worn, or damaged hardwood floors, restoring their natural beauty and extending their lifespan for a fraction of replacement cost.",
    features: [
      "Removes scratches, dents, stains, and wear patterns",
      "Option to change stain color and finish type",
      "Fills cracks and gaps for a smooth, uniform appearance",
      "Typically completed in 3-5 days with minimal disruption"
    ],
    beforeImage: "https://images.unsplash.com/photo-1585947920741-a59fe6dd233c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1581782250144-25fdb783c355?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "4",
    title: "Tile & Custom Showers",
    shortDescription: "Beautiful tile installation for floors and showers.",
    fullDescription: `
      <p>Our professional tile installation services create beautiful, durable surfaces for floors, showers, backsplashes, and more, transforming your spaces with expert craftsmanship.</p>
      
      <h3>Tile Flooring Installation</h3>
      <p>Tile flooring offers exceptional durability and design versatility:</p>
      <ul>
        <li>Porcelain, ceramic, natural stone, and luxury options</li>
        <li>Suitable for kitchens, bathrooms, entryways, and living spaces</li>
        <li>Variety of sizes, colors, and patterns</li>
        <li>Expert preparation of subfloors for long-lasting results</li>
        <li>Precision cutting and placement for perfect alignment</li>
        <li>Professional grouting with color options to complement your tile</li>
      </ul>
      
      <h3>Custom Shower Installation</h3>
      <p>Our custom shower installations combine functionality with stunning aesthetics:</p>
      <ul>
        <li>Complete waterproofing systems for leak-free performance</li>
        <li>Custom shower pans and bases</li>
        <li>Niches, benches, and other built-in features</li>
        <li>Decorative accent tiles and borders</li>
        <li>Glass door and enclosure installation</li>
        <li>Specialty installations like curbless showers and steam showers</li>
      </ul>
      
      <h3>Backsplash Installation</h3>
      <p>Enhance your kitchen or bathroom with a custom backsplash that provides style and protection:</p>
      <ul>
        <li>Wide selection of tile materials and designs</li>
        <li>Decorative patterns and layouts</li>
        <li>Coordinated with your countertops and cabinetry</li>
        <li>Properly sealed for easy cleaning and maintenance</li>
      </ul>
      
      <h3>Types of Tile We Install</h3>
      <p>We work with all types of tile materials including:</p>
      <ul>
        <li>Ceramic and porcelain</li>
        <li>Natural stone (marble, granite, travertine, slate)</li>
        <li>Glass tile</li>
        <li>Mosaic patterns</li>
        <li>Large-format tiles</li>
        <li>Specialty tiles and decorative accents</li>
      </ul>
      
      <h3>Quality Assurance</h3>
      <p>Our tile installations include proper underlayment, waterproofing, and premium setting materials to ensure your tile will look beautiful and perform flawlessly for years to come.</p>
    `,
    icon: "Grid",
    image: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "tile",
    metaDescription: "Expert tile installation services for floors, showers, and backsplashes in Louisiana and Alabama. Beautiful, durable custom tile solutions for your home.",
    category: "residential",
    description: "Our expert tile installation transforms bathrooms, kitchens, and living spaces with beautiful, durable surfaces including custom showers, floors, and decorative backsplashes.",
    features: [
      "Custom shower designs with waterproofing systems for leak-free performance",
      "Wide selection of porcelain, ceramic, and natural stone tiles",
      "Decorative options including mosaics and custom patterns",
      "Built-in features like niches, benches, and heated floors"
    ],
    beforeImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "5",
    title: "Commercial Flooring",
    shortDescription: "Durable solutions for businesses and commercial spaces.",
    fullDescription: `
      <p>Our commercial flooring solutions are designed to meet the unique demands of business environments, offering durability, aesthetics, and value for retail spaces, offices, restaurants, healthcare facilities, and more.</p>
      
      <h3>Commercial Flooring Options</h3>
      <p>We offer a wide range of commercial-grade flooring solutions:</p>
      <ul>
        <li>Commercial-grade luxury vinyl tile (LVT) and plank (LVP)</li>
        <li>Commercial carpet and carpet tiles</li>
        <li>Hardwood and engineered wood options</li>
        <li>Porcelain and ceramic tile</li>
        <li>Rubber flooring</li>
        <li>Polished concrete</li>
        <li>Epoxy coatings</li>
      </ul>
      
      <h3>Benefits of Professional Commercial Installation</h3>
      <p>Our commercial installation services provide:</p>
      <ul>
        <li>Minimal business disruption with flexible scheduling</li>
        <li>ADA compliance and safety considerations</li>
        <li>Proper preparation of subfloors and surfaces</li>
        <li>Moisture testing and mitigation when needed</li>
        <li>Precise installation meeting manufacturer specifications</li>
        <li>Expert handling of transitions and special details</li>
      </ul>
      
      <h3>Industry-Specific Solutions</h3>
      <p>We understand the unique requirements of different commercial settings:</p>
      <ul>
        <li>Retail: Attractive, durable floors that withstand high traffic</li>
        <li>Offices: Professional, comfortable, and acoustically beneficial options</li>
        <li>Healthcare: Hygienic, easy-to-clean surfaces meeting sanitation requirements</li>
        <li>Restaurants: Slip-resistant, spill-proof flooring for safety and maintenance</li>
        <li>Education: Durable, safe, and low-maintenance solutions</li>
        <li>Hospitality: Aesthetically pleasing options that withstand heavy use</li>
      </ul>
      
      <h3>Project Management</h3>
      <p>Our commercial projects include comprehensive project management:</p>
      <ul>
        <li>Detailed quotes and timelines</li>
        <li>Material procurement and logistics</li>
        <li>Coordination with other contractors when needed</li>
        <li>Regular project updates</li>
        <li>Quality control inspections</li>
        <li>Warranty information and maintenance guidelines</li>
      </ul>
      
      <h3>Maintenance Programs</h3>
      <p>We offer ongoing maintenance programs to protect your investment and keep your commercial floors looking their best for years to come.</p>
    `,
    icon: "Building",
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "commercial",
    metaDescription: "Professional commercial flooring solutions in Louisiana and Alabama. Durable, attractive flooring for offices, retail, healthcare, and other business spaces.",
    category: "commercial",
    description: "Our commercial flooring solutions deliver exceptional durability, safety, and aesthetics for high-traffic business environments including offices, retail spaces, and healthcare facilities.",
    features: [
      "High-performance materials designed for commercial traffic levels",
      "ADA compliant installations with proper transitions",
      "Minimal disruption to business operations",
      "Comprehensive project management from start to finish"
    ],
    beforeImage: "https://images.unsplash.com/photo-1565538420870-da08ff96a207?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "6",
    title: "Epoxy Flooring",
    shortDescription: "Seamless, durable epoxy floors for garages and commercial spaces.",
    fullDescription: `
      <p>Our epoxy flooring services create seamless, high-performance surfaces that combine exceptional durability with customizable aesthetics for garages, basements, commercial kitchens, industrial facilities, and more.</p>
      
      <h3>Benefits of Epoxy Flooring</h3>
      <p>Epoxy floors offer numerous advantages:</p>
      <ul>
        <li>Exceptional durability and longevity</li>
        <li>Chemical, stain, and impact resistance</li>
        <li>Seamless, easy-to-clean surface</li>
        <li>Decorative options including metallic effects and color flakes</li>
        <li>Anti-slip additives for increased safety</li>
        <li>Moisture-resistant properties</li>
        <li>Dust-free and hygienic surface</li>
      </ul>
      
      <h3>Our Installation Process</h3>
      <p>Proper application is critical for epoxy performance:</p>
      <ul>
        <li>Thorough surface preparation including diamond grinding</li>
        <li>Crack and joint repair</li>
        <li>Moisture testing and vapor barrier application when needed</li>
        <li>Application of primer coat for optimal adhesion</li>
        <li>Installation of decorative elements if selected</li>
        <li>Application of multiple epoxy layers for durability</li>
        <li>Top coat application for UV stability and enhanced protection</li>
        <li>Proper curing time with climate control as needed</li>
      </ul>
      
      <h3>Customization Options</h3>
      <p>Our epoxy floors can be customized to your preferences:</p>
      <ul>
        <li>Solid colors in virtually any shade</li>
        <li>Decorative flake systems in custom color combinations</li>
        <li>Metallic epoxy with dimensional, swirled effects</li>
        <li>Quartz systems for aggressive environments</li>
        <li>Custom logos and designs</li>
        <li>Varying gloss levels from matte to high-gloss</li>
      </ul>
      
      <h3>Applications</h3>
      <p>Epoxy flooring is ideal for numerous environments:</p>
      <ul>
        <li>Residential garages and basements</li>
        <li>Commercial kitchens and restaurants</li>
        <li>Retail spaces</li>
        <li>Warehouses and industrial facilities</li>
        <li>Healthcare environments</li>
        <li>Automotive showrooms</li>
        <li>Educational institutions</li>
      </ul>
    `,
    icon: "Brush",
    image: "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "epoxy",
    metaDescription: "Professional epoxy flooring installation in Louisiana and Alabama. Durable, seamless floors for garages, basements, and commercial spaces.",
    category: "commercial",
    description: "Our epoxy flooring systems provide exceptional durability, chemical resistance, and customizable aesthetics for garage floors, basements, and commercial environments.",
    features: [
      "Chemical and stain resistant surface that's easy to clean",
      "Customizable with decorative chips, metallic pigments, and color options",
      "Seamless, non-porous surface that prevents dust and allergens",
      "5-7 day installation process with proper curing time"
    ],
    beforeImage: "https://images.unsplash.com/photo-1515180252313-f87e5da06db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];