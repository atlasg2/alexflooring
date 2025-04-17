import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Dribbble } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary/95 text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white/90 font-montserrat">
              APS Flooring <span className="text-secondary">LLC</span>
            </h3>
            <p className="mb-6 text-white/70">
              Professional flooring solutions serving Louisiana and Alabama homeowners with quality installations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-secondary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-secondary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-secondary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-secondary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20" aria-label="Dribbble">
                <Dribbble className="h-5 w-5" />
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
                <div className="text-secondary mt-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-white/70">123 Flooring Way<br/>New Orleans, LA 70123</span>
              </li>
              <li className="flex">
                <div className="text-secondary mt-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:5045551234" className="text-white/70 hover:text-secondary transition duration-300">(504) 555-1234</a>
              </li>
              <li className="flex">
                <div className="text-secondary mt-1 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:info@apsflooringllc.com" className="text-white/70 hover:text-secondary transition duration-300">
                  info@apsflooringllc.com
                </a>
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
