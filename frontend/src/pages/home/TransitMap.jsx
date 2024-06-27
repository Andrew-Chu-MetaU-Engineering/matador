import PropTypes from "prop-types";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Polyline } from "./Polyline";

export default function TransitMap({ encodedPath }) {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <Map
        defaultCenter={{ lat: 37.4868, lng: -122.1483 }}
        defaultZoom={10}
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
      >
        <Polyline
          strokeWeight={8}
          strokeColor={"#000000"}
          encodedPath={encodedPath}
        />
      </Map>
    </APIProvider>
  );
}

TransitMap.propTypes = {
  encodedPath: PropTypes.string.isRequired,
};
