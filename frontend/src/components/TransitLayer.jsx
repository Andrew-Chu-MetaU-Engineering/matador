import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export default function TransitLayer() {
  // components must be sibling of Map component in order to call useMap()
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
  }, [map]);
}
