import PropTypes from "prop-types";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Polyline } from "./Polyline";

export default function TransitMap({ encodedPath, setMapBounds, children }) {
  const {
    VITE_GOOGLE_API_KEY,
    VITE_DEFAULT_VIEW_LAT,
    VITE_DEFAULT_VIEW_LNG,
    VITE_MAP_ID,
  } = import.meta.env;

  return (
    <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
      <Map
        mapId={VITE_MAP_ID}
        reuseMaps={true}
        defaultCenter={{
          lat: parseFloat(VITE_DEFAULT_VIEW_LAT),
          lng: parseFloat(VITE_DEFAULT_VIEW_LNG),
        }}
        defaultZoom={10}
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
        onBoundsChanged={(e) => setMapBounds(e.detail.bounds)}
      >
        {encodedPath && (
          <Polyline
            strokeWeight={8}
            strokeColor={"#ff0000"}
            encodedPath={encodedPath}
          />
        )}
      </Map>
      {children}
    </APIProvider>
  );
}

TransitMap.propTypes = {
  encodedPath: PropTypes.string,
  setMapBounds: PropTypes.func.isRequired,
};
