import { Link } from "wouter";
import { Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";
import apsLogoPath from "@assets/aps_logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary/95 text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <img 
                src={apsLogoPath} 
                alt="APS Flooring LLC Logo" 
                className="h-12 w-12 mr-3 rounded-full" 
              />
              <h3 className="text-2xl font-bold text-white/90 font-montserrat">
                APS Flooring <span className="text-secondary">LLC</span>
              </h3>
            </div>
            <p className="mb-6 text-white/70">
              Flooring that speaks to you. We create spaces that feel uniquely yours with passion and expertise in every installation.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/APSFlooringLLC" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-secondary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-secondary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 text-white/90">Our Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services/hardwood" className="text-white/70 hover:text-secondary transition duration-300">
                  Hardwood Installation
                </Link>
              </li>
              <li>
                <Link href="/services/lvp" className="text-white/70 hover:text-secondary transition duration-300">
                  Luxury Vinyl Plank
                </Link>
              </li>
              <li>
                <Link href="/services/refinishing" className="text-white/70 hover:text-secondary transition duration-300">
                  Floor Refinishing
                </Link>
              </li>
              <li>
                <Link href="/services/tile" className="text-white/70 hover:text-secondary transition duration-300">
                  Tile & Custom Showers
                </Link>
              </li>
              <li>
                <Link href="/services/commercial" className="text-white/70 hover:text-secondary transition duration-300">
                  Commercial Flooring
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 text-white/90">Service Areas</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/birmingham" className="text-white/70 hover:text-secondary transition duration-300">
                  Birmingham, AL
                </Link>
              </li>
              <li>
                <Link href="/new-orleans" className="text-white/70 hover:text-secondary transition duration-300">
                  New Orleans, LA
                </Link>
              </li>
              <li>
                <Link href="/birmingham#areas" className="text-white/70 hover:text-secondary transition duration-300">
                  Hoover, AL
                </Link>
              </li>
              <li>
                <Link href="/birmingham#areas" className="text-white/70 hover:text-secondary transition duration-300">
                  Vestavia Hills, AL
                </Link>
              </li>
              <li>
                <Link href="/new-orleans#areas" className="text-white/70 hover:text-secondary transition duration-300">
                  Metairie, LA
                </Link>
              </li>
              <li>
                <Link href="/new-orleans#areas" className="text-white/70 hover:text-secondary transition duration-300">
                  Chalmette, LA
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 text-white/90">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex">
                <div className="text-secondary mr-3 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-white/70">323 E Vitale St<br/>Chalmette, LA 70043</span>
              </li>
              <li className="flex">
                <div className="text-secondary mr-3 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <a href="tel:5044023895" className="text-white/70 hover:text-secondary transition duration-300">(504) 402-3895</a>
              </li>
              <li className="flex">
                <div className="text-secondary mr-3 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <a href="mailto:info@apsflooringllc.com" className="text-white/70 hover:text-secondary transition duration-300">
                  info@apsflooringllc.com
                </a>
              </li>
              <li className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/70 text-sm">
                  <span className="font-medium text-white">Hours:</span><br/>
                  Monday - Friday: 8 AM - 6 PM<br/>
                  Saturday: By appointment<br/>
                  Sunday: Closed
                </p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} APS Flooring LLC. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="text-white/60 text-sm hover:text-secondary transition-all duration-300 hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-white/60 text-sm hover:text-secondary transition-all duration-300 hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="text-white/60 text-sm hover:text-secondary transition-all duration-300 hover:underline underline-offset-4">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
