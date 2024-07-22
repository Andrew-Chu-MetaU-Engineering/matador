import PropTypes from "prop-types";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Polyline } from "./Polyline";

export default function TransitMap({
  encodedPath,
  setMapBounds,
  focusBounds,
  children,
}) {
  const { VITE_GOOGLE_API_KEY, VITE_DEFAULT_BOUNDS, VITE_MAP_ID } = import.meta
    .env;

  return (
    <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
      <Map
        mapId={VITE_MAP_ID}
        reuseMaps={true}
        defaultBounds={
          focusBounds == null ? JSON.parse(VITE_DEFAULT_BOUNDS) : focusBounds
        }
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
        onBoundsChanged={(e) => {
          if (setMapBounds != null) {
            setMapBounds(e.detail.bounds);
          }
        }}
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
  setMapBounds: PropTypes.func,
  focusBounds: PropTypes.object,
  children: PropTypes.node,
};
