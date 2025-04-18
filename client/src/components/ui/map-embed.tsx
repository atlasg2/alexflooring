import { useMemo } from "react";

interface MapEmbedProps {
  address: string;
  city: string;
  zoom?: number;
  width?: string;
  height?: string;
}

// Get the Google Maps API key from the environment if available
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD21wkThWPi7nAp8v1samUle57-Qyy2Gvk";

const MapEmbed = ({
  address,
  city,
  zoom = 14,
  width = "100%",
  height = "100%"
}: MapEmbedProps) => {
  const encodedAddress = useMemo(() => {
    return encodeURIComponent(address);
  }, [address]);

  // Create the map URL with the API key
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=${zoom}`;

  return (
    <iframe
      title={`Map of APS Flooring in ${city}`}
      src={mapUrl}
      width={width}
      height={height}
      style={{ border: 0 }}
      allowFullScreen={false}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      aria-label={`Map showing the location of APS Flooring in ${city}`}
    ></iframe>
  );
};

export default MapEmbed;
