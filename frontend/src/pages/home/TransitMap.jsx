import PropTypes from "prop-types";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Polyline } from "./Polyline";

export default function TransitMap({ encodedPath, setMapBounds }) {
  const { VITE_GOOGLE_API_KEY, VITE_DEFAULT_VIEW_LAT, VITE_DEFAULT_VIEW_LNG } =
    import.meta.env;
  return (
    <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
      <Map
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
            strokeColor={"#000000"}
            encodedPath={encodedPath}
          />
        )}
      </Map>
    </APIProvider>
  );
}

TransitMap.propTypes = {
  encodedPath: PropTypes.string,
  setMapBounds: PropTypes.func.isRequired,
};
