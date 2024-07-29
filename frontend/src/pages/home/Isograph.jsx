import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useMap, useApiIsLoaded } from "@vis.gl/react-google-maps";
import * as d3 from "d3";
import Tooltip from "../../components/Tooltip";
const { VITE_EXPRESS_API, VITE_COST_TYPE_DURATION, VITE_COST_TYPE_FARE } =
  import.meta.env;

export default function Isograph({ isographSettings }) {
  const REFETCH_THRESHOLD_MS = 60 * 1000; // only fetch new data for >1min diff in departure time
  const [isographData, setIsographData] = useState(null);
  const [isographMapLayer, setIsographMapLayer] = useState(null);
  const [tooltipValue, setTooltipValue] = useState(null);
  const [mouseListeners, setMouseListeners] = useState(null);
  const [prevIsographSettings, setPrevIsographSettings] = useState({
    originAddress: null,
    departureTime: null,
  });
  const apiIsLoaded = useApiIsLoaded();
  const map = useMap();

  // Initialize Google Maps data layer and fetch isograph data
  useEffect(() => {
    // check refetch frequency
    if (
      isographSettings.originAddress === prevIsographSettings.originAddress &&
      prevIsographSettings.departureTime != null &&
      Math.abs(
        new Date(isographSettings.departureTime) -
          new Date(prevIsographSettings.departureTime)
      ) < REFETCH_THRESHOLD_MS
    ) {
      return;
    } else {
      setPrevIsographSettings(isographSettings);
    }

    if (apiIsLoaded == null || map == null || isographSettings == null) {
      return;
    } else if (isographMapLayer == null) {
      setIsographMapLayer(new google.maps.Data());
    }

    const { originAddress, departureTime } = isographSettings;
    if (originAddress.length === 0 || departureTime.length === 0) {
      return;
    } else {
      fetchIsographData(originAddress, departureTime);
    }
  }, [
    isographSettings.originAddress,
    isographSettings.departureTime,
    apiIsLoaded,
    map,
  ]);

  // Calculate contour shapes and attach to map with stylin
  useEffect(() => {
    if (isographData == null) return;
    const typeIsographData = isographData[isographSettings.costType];

    // reset data layer
    isographMapLayer.forEach((feature) => {
      isographMapLayer.remove(feature);
    });
    // remove listeners
    mouseListeners?.forEach((listener) => {
      listener.remove();
    });
    setMouseListeners(null);

    try {
      const featureCollection = calculateContours(typeIsographData);

      isographMapLayer.addGeoJson(featureCollection);
      addIsographStyling(isographMapLayer, featureCollection);
      addListeners(isographMapLayer);
      isographMapLayer.setMap(map);
    } catch (error) {
      console.error(error.message);
    }
  }, [isographData, isographSettings.costType]);

  return (
    tooltipValue && (
      <Tooltip text={tooltipValue} mouseOffset={{ x: -47, y: -41 }} /> // offset values found through manual testing
    )
  );

  async function fetchIsographData(originAddress, departureTime) {
    try {
      let url = new URL("isograph", VITE_EXPRESS_API);
      url.searchParams.append("originAddress", originAddress);
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

    const costs = isographData.map(([_lng, _lat, cost]) => cost);
    const contourGenerator = d3
      .contours()
      .size([gridWidth, gridWidth])
      .thresholds(10)
      .smooth(true);
    let contours = contourGenerator(costs).filter(
      (contour) => contour.value >= 0
    );

    // Scale and transform the contour points to match geographic coordinates
    const [originLng, originLat] = isographData[0];
    const [diagonalLng, diagonalLat] = isographData[gridWidth + 1]; // the point with one increment in each x/y direction in the grid
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
      features: contours.map((contour, i) => ({
        type: "Feature",
        geometry: contour,
        properties: {
          value: contour.value,
          displayCost: formatDisplayCost(i, contours),
        },
      })),
    };
  }

  function formatDisplayCost(i, contours) {
    let prepend = "";
    let append = "";
    switch (isographSettings.costType) {
      case VITE_COST_TYPE_DURATION:
        append = " min";
        break;
      case VITE_COST_TYPE_FARE:
        prepend = "$";
        break;
    }

    return i === contours.length - 1
      ? `> ${prepend}${contours[i].value}${append}`
      : `< ${prepend}${contours[i + 1].value}${append}`;
  }

  function addIsographStyling(mapLayer, featureCollection) {
    const thresholds = featureCollection?.features.map(
      (feature) => feature.properties.value
    );
    const minThresh = Math.min(...thresholds);
    const maxThresh = Math.max(...thresholds);
    mapLayer.setStyle((feature) => {
      const cost = feature.getProperty("value");
      const normalizedCost = (cost - minThresh) / (maxThresh - minThresh);
      return {
        fillColor: d3.interpolateTurbo(normalizedCost),
        fillOpacity: 0.2,
        strokeColor: "lightgrey",
        strokeWeight: 1,
        zIndex: normalizedCost,
      };
    });
  }

  function addListeners(mapLayer) {
    const mouseoverListenerIndentifier = mapLayer.addListener(
      "mouseover",
      (e) => {
        setTooltipValue(e.feature.getProperty("displayCost"));
        mapLayer.overrideStyle(e.feature, {
          strokeColor: "white",
          strokeWeight: 2,
        });
      }
    );
    const mouseoutListenerIdentifier = mapLayer.addListener("mouseout", () => {
      setTooltipValue("");
      mapLayer.revertStyle(null);
    });

    setMouseListeners([
      mouseoverListenerIndentifier,
      mouseoutListenerIdentifier,
    ]);
  }
}

Isograph.propTypes = {
  isographSettings: PropTypes.object,
};
