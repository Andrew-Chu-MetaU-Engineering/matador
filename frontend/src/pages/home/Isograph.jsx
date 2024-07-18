import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useMap, useApiIsLoaded } from "@vis.gl/react-google-maps";
import * as d3 from "d3";
const { VITE_EXPRESS_API } = import.meta.env;

export default function Isograph({ isographSettings }) {
  const [isographData, setIsographData] = useState(null);
  const [isographMapLayer, setIsographMapLayer] = useState(null);
  const apiIsLoaded = useApiIsLoaded();
  const map = useMap();

  async function fetchIsographData(originAddress, costType, departureTime) {
    try {
      let url = new URL("isograph", VITE_EXPRESS_API);
      url.searchParams.append("originAddress", originAddress);
      url.searchParams.append("costType", costType);
      url.searchParams.append("departureTime", departureTime);

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
    const gridWidth = Math.sqrt(isographData.length);

    const costs = isographData.map(([lng, lat, cost]) => cost);
    const contourGenerator = d3
      .contours()
      .size([gridWidth, gridWidth])
      .thresholds(10)
      .smooth(true);
    let contours = contourGenerator(costs).filter(
      (contour) => contour.value >= 0
    );

    const [originLng, originLat, _originCost] = isographData[0];
    const [diagonalLng, diagonalLat, _diagonalCost] =
      isographData[gridWidth + 1]; // the point with one increment in each x/y direction in the grid
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
    mapData.setStyle((feature) => {
      const cost = feature.getProperty("value");
      const normalizedCost = (cost - minThresh) / (maxThresh - minThresh);
      return {
        fillColor: d3.interpolateTurbo(normalizedCost),
        fillOpacity: 0.2,
        strokeColor: "lightgrey",
        strokeWeight: 1,
      };
    });

    mapData.addListener("mouseover", (e) => {
      mapData.overrideStyle(e.feature, {
        strokeColor: "white",
        strokeWeight: 2,
      });
    });
    mapData.addListener("mouseout", () => {
      mapData.revertStyle();
    });
    return mapData;
  }

  useEffect(() => {
    if (apiIsLoaded == null || map == null || isographSettings == null) {
      return;
    } else if (isographMapLayer == null) {
      setIsographMapLayer(new google.maps.Data());
    }

    const { originAddress, costType, departureTime } = isographSettings;
    if (
      originAddress.length === 0 ||
      costType.length === 0 ||
      departureTime.length === 0
    ) {
      return;
    } else {
      fetchIsographData(originAddress, costType, departureTime);
    }
  }, [isographSettings, apiIsLoaded, map]);

  useEffect(() => {
    if (isographData == null) return;

    // reset data layer
    isographMapLayer.forEach((feature) => {
      isographMapLayer.remove(feature);
    });

    try {
      const featureCollection = calculateContours(isographData);

      isographMapLayer.addGeoJson(featureCollection);
      addIsographStyling(isographMapLayer, featureCollection);
      isographMapLayer.setMap(map);
    } catch (error) {
      console.error(error.message);
    }
  }, [isographData]);
}

Isograph.propTypes = {
  isographSettings: PropTypes.object,
};
