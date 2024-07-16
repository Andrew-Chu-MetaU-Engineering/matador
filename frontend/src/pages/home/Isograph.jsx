import { useEffect, useState } from "react";
import {
  useMap,
  useApiIsLoaded,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

export default function Isograph() {
  const { VITE_EXPRESS_API } = import.meta.env;
  const [isographData, setIsographData] = useState(null);
  const apiIsLoaded = useApiIsLoaded();
  const visualizationLibrary = useMapsLibrary("visualization");
  const map = useMap();

  async function fetchIsographData() {
    // TODO to be changed to user inputs
    const ORIGIN = [37.42, -122.1];
    const COST_TYPE = "duration";
    const DEPARTURE_TIME = new Date(Date.now()).toISOString();

    try {
      let url = new URL("isograph", VITE_EXPRESS_API);
      url.searchParams.append("origin", ORIGIN);
      url.searchParams.append("costType", COST_TYPE);
      url.searchParams.append("departureTime", DEPARTURE_TIME);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error. Status ${response.status}`);
      }
      const data = await response.json();
      setIsographData(data);
    } catch (error) {
      console.error("Error fetching isograph data:", error);
    }
  }

  useEffect(() => {
    if (apiIsLoaded == null || map == null) return;
    fetchIsographData();
  }, [apiIsLoaded, map]);

  useEffect(() => {
    if (isographData == null || visualizationLibrary == null) return;

    const heatMapData = isographData.map(([lat, lng, cost]) => ({
      location: new google.maps.LatLng(lat, lng),
      weight: cost,
    }));
    const heatmap = new visualizationLibrary.HeatmapLayer({
      data: heatMapData,
      dissipating: true,
    });
    heatmap.setMap(map);
  }, [isographData, visualizationLibrary]);
}
