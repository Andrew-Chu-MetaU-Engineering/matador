import { useEffect, useState } from "react";
import {
  useMap,
  useApiIsLoaded,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import * as d3 from "d3";

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
    const [diagonalLng, diagonalLat, _diagonalCost] = isographData[WIDTH + 1]; // the point with one increment in each x/y direction in the grid
    for (const contour of contours) {
      contour.coordinates = contour.coordinates.map((polygon) =>
        polygon.map((line) =>
          line.map(([costX, costY]) => [
          costX * (diagonalLng - originLng) + originLng,
          costY * (diagonalLat - originLat) + originLat,
          ])
        )
      );
    }

    return {
      type: "FeatureCollection",
      features: contours.map((contour) => ({
        type: "Feature",
        geometry: contour,
        properties: {
          value: contour.value,
        },
      })),
    };
  }

  function addIsographStyling(mapData, featureCollection) {
    const thresholds = featureCollection?.features.map(
      (feature) => feature.properties.value
    );
    const minThresh = Math.min(...thresholds);
    const maxThresh = Math.max(...thresholds);
    mapData.setStyle(function (feature) {
      const cost = feature.getProperty("value");
      const normalizedCost = (cost - minThresh) / (maxThresh - minThresh);
      return {
        fillColor: d3.interpolateTurbo(normalizedCost),
        fillOpacity: 0.2,
        strokeColor: "lightgrey",
        strokeWeight: 1,
      };
    });

    mapData.addListener("mouseover", function (e) {
      mapData.overrideStyle(e.feature, {
        strokeColor: "white",
        strokeWeight: 2,
      });
    });
    mapData.addListener("mouseout", function () {
      mapData.revertStyle();
    });
    return mapData;
  }

  useEffect(() => {
    if (apiIsLoaded == null || map == null) return;
    fetchIsographData();
  }, [apiIsLoaded, map]);

  useEffect(() => {
    if (isographData == null || visualizationLibrary == null) return;

    try {
      const featureCollection = calculateContours(isographData);

      let data = new google.maps.Data();
      data.addGeoJson(featureCollection);
      addIsographStyling(data, featureCollection);
      data.setMap(map);
    } catch (error) {
      console.log(error.message);
    }
  }, [isographData, visualizationLibrary]);
}
