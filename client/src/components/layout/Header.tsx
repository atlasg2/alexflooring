import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, UserCircle } from "lucide-react";
import apsLogoPath from "@assets/aps_logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const navLinks = [
    { text: "Services", href: "/#services" },
    { text: "Projects", href: "/projects" },
    { text: "New Orleans", href: "/new-orleans" },
    { text: "Chalmette", href: "/chalmette" },
    { text: "Blog", href: "/blog" },
    { text: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return location === "/";
    return location === href;
  };

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-lg z-50 transition-all duration-300">
      {/* Top bar with contact info */}
      <div className="bg-primary/10 py-1.5">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center">
            <a 
              href="tel:5044023895" 
              className="flex items-center text-primary hover:text-secondary transition-colors duration-300"
            >
              <Phone className="h-4 w-4 mr-1.5" />
              <span className="font-medium">(504) 402-3895</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center group">
            <img 
              src={apsLogoPath} 
              alt="APS Flooring LLC Logo" 
              className="h-12 w-12 mr-3 rounded-full shadow-sm" 
            />
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary transition-colors duration-300 group-hover:text-primary/90 font-montserrat">APS Flooring</span>
                <span className="text-secondary font-bold ml-1 transition-colors duration-300 group-hover:text-secondary/90 font-montserrat">LLC</span>
              </div>
              <span className="text-xs text-gray-600">Professional Flooring Solutions in Louisiana</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <nav className="flex space-x-6 mr-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`relative text-gray-800 hover:text-secondary font-medium transition-all duration-300 py-2
                    after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary 
                    after:transition-all after:duration-300 hover:after:w-full
                    ${isActive(link.href) ? "text-secondary after:w-full" : ""}`}
                >
                  {link.text}
                </Link>
              ))}
            </nav>
            
            {/* Login Buttons */}
            <div className="flex space-x-2">
              <Link href="/customer/auth">
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex items-center gap-1 bg-secondary hover:bg-secondary/90 text-white"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Customer Portal</span>
                </Button>
              </Link>
              
              <Link href="/admin/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 border-primary/20 text-primary hover:text-secondary hover:border-secondary/30"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden text-primary hover:text-secondary hover:bg-primary/5 transition-colors duration-300"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 shadow-inner animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-gray-800 hover:text-secondary font-medium py-2 transition-all duration-300 
                  border-l-2 pl-3 ${isActive(link.href) ? "border-secondary text-secondary" : "border-transparent"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}
            <a 
              href="tel:5044023895" 
              className="flex items-center text-primary hover:text-secondary transition-colors duration-300 border-l-2 border-transparent pl-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Phone className="h-4 w-4 mr-2" />
              <span className="font-medium">Call Us: (504) 402-3895</span>
            </a>
            
            {/* Customer Portal link in mobile menu */}
            <Link 
              href="/customer/auth"
              className="flex items-center text-secondary hover:text-secondary/80 transition-colors duration-300 border-l-2 border-secondary pl-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Customer Portal</span>
            </Link>
            
            {/* Admin Login in mobile menu */}
            <Link 
              href="/admin/login"
              className="flex items-center text-primary hover:text-secondary transition-colors duration-300 border-l-2 border-transparent pl-3 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Admin Login</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
