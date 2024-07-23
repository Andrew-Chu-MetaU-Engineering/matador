import { useLocation } from "react-router-dom";
import { Box, Paper, ScrollArea, Text } from "@mantine/core";
import StepInfoPane from "./StepInfoPane";
import TransitMap from "../../components/TransitMap";
import HomeButton from "../../components/HomeButton";
import "./RouteDetail.css";

export default function RouteDetail() {
  const {
    place,
    route: { viewport, polyline, legs },
  } = useLocation().state.option;

  return (
    <Paper>
      <HomeButton />
      <Paper id="route-detail-body">
        <Box id="route-map-area">
          <TransitMap
            encodedPath={polyline.encodedPolyline}
            focusBounds={{
              north: viewport.high.latitude,
              east: viewport.high.longitude,
              south: viewport.low.latitude,
              west: viewport.low.longitude,
            }}
          />
        </Box>
        <Paper id="detail-panel" shadow="xs" radius="md">
          <Text size="lg" fw={800} ta="center" m="sm">
            Route to {place.displayName.text}
          </Text>
          <ScrollArea>
            {legs.map((leg) => {
              return leg.steps?.map((step, i) => (
                <StepInfoPane key={i} step={step} />
              ));
            })}
          </ScrollArea>
        </Paper>
      </Paper>
    </Paper>
  );
}
