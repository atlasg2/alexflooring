import { Helmet } from "react-helmet-async";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import MapEmbed from "@/components/ui/map-embed";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - APS Flooring LLC</title>
        <meta name="description" content="Contact APS Flooring for a free estimate on your flooring project. Serving Louisiana and Alabama with professional flooring installation and refinishing services." />
      </Helmet>

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)" }}>
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl">
              Get in touch for a free estimate or to learn more about our flooring services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <div className="bg-gray-100 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-primary mb-6">Get a Free Estimate</h2>
                <ContactForm />
              </div>
              
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Phone</h3>
                      <p className="text-gray-700">New Orleans: (504) 555-1234</p>
                      <p className="text-gray-700">Birmingham: (205) 555-5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Email</h3>
                      <p className="text-gray-700">
                        <a href="mailto:info@apsflooringllc.com" className="hover:text-primary transition-colors">
                          info@apsflooringllc.com
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                      <p className="text-gray-700">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-700">Saturday: 9:00 AM - 2:00 PM</p>
                      <p className="text-gray-700">Sunday: Closed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Locations</h3>
                      <p className="text-gray-700 mb-1">
                        <strong>New Orleans:</strong> 123 Flooring Way, New Orleans, LA 70123
                      </p>
                      <p className="text-gray-700">
                        <strong>Birmingham:</strong> 456 Oak Street, Birmingham, AL 35203
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-primary mb-4">Our Service Areas</h3>
                  <p className="text-gray-700 mb-4">
                    We provide flooring services throughout Louisiana and Alabama, including:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="font-bold mb-2">Louisiana</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>New Orleans</li>
                        <li>Metairie</li>
                        <li>Chalmette</li>
                        <li>Kenner</li>
                        <li>Slidell</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Alabama</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>Birmingham</li>
                        <li>Hoover</li>
                        <li>Vestavia Hills</li>
                        <li>Mountain Brook</li>
                        <li>Homewood</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-primary mb-6">Find Us</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapEmbed 
                  address="123 Flooring Way, New Orleans, LA 70123"
                  city="New Orleans"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
