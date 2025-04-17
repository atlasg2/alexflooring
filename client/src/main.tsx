import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet, HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <meta charSet="utf-8" />
      <title>APS Flooring LLC - Transform Your Space with Beautiful Flooring</title>
      <meta name="description" content="Professional flooring services in Louisiana and Alabama. Specializing in hardwood, luxury vinyl, tile, and commercial flooring installation." />
    </Helmet>
    <App />
  </HelmetProvider>
);
