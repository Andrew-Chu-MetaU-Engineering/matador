import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Polyline } from "./Polyline";

export default function TransitMap() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <Map
        id="google-map"
        defaultCenter={{ lat: 37.4868, lng: -122.1483 }}
        defaultZoom={10}
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
      >
        <Polyline
          strokeWeight={8}
          strokeColor={"#000000"}
          encodedPath={
            "qydcFzlchVa@dA{@YCDA?Qd@AC[v@I^IR?BJHaJtUkBnEyKzXkAzBq@fAwAbBwHtH_BdCcArBq@lBgHdToCdI{JbZsEvMqN`\\IG?AfAgCPYGE^aADBP[EISAI_@EGCQ[UL]s@c@FOOK"
          }
        />
      </Map>
    </APIProvider>
  );
}
