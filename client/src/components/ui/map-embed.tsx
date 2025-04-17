import { useMemo } from "react";

interface MapEmbedProps {
  address: string;
  city: string;
  zoom?: number;
  width?: string;
  height?: string;
}

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

  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=m&z=${zoom}&output=embed&iwloc=near`;

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
