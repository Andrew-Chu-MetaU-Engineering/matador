import { useEffect, useState } from "react";
import {
  useMap,
  useApiIsLoaded,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import * as d3 from "d3";
import { geoMercator } from "d3-geo";

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

  function calculateContours(isographData) {
    const WIDTH = 100;

    const costs = isographData.map(([lng, lat, cost]) => cost);
    const contourGenerator = d3.contours().size([WIDTH, WIDTH]).smooth(true);
    let contours = contourGenerator(costs).filter(
      (contour) => contour.value >= 0
    );

    const [originLng, originLat, _originCost] = isographData[0];
    const [diagonalLng, diagonalLat, _diagonalCost] = isographData[WIDTH + 1];
    for (const contour of contours) {
      const polygons = contour.coordinates;
      for (const polygon of polygons) {
        polygon[0] = polygon[0].map(([costX, costY]) => [
          costX * (diagonalLng - originLng) + originLng,
          costY * (diagonalLat - originLat) + originLat,
        ]);
      }
    }

    const featureCollection = {
      type: "FeatureCollection",
      features: [],
    };
    contours.forEach((contour) =>
      featureCollection.features.push({
        type: "Feature",
        geometry: contour,
        properties: {},
      })
    );
    return featureCollection;
  }

  useEffect(() => {
    if (apiIsLoaded == null || map == null) return;
    fetchIsographData();
  }, [apiIsLoaded, map]);

  useEffect(() => {
    if (isographData == null || visualizationLibrary == null) return;

    try {
      let data = new google.maps.Data();
      data.addGeoJson(calculateContours(isographData));
      data.setStyle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        fillColor: "#FF0000",
        fillOpacity: 0.01,
      });
      data.setMap(map);
    } catch (error) {
      console.log(error.message);
    }
  }, [isographData, visualizationLibrary]);
}
