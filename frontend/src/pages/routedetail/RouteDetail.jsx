import { Box, Paper } from "@mantine/core";
import "./RouteDetail.css";

export default function RouteDetail() {
  return (
    <Paper>
      <Paper id="route-detail-body">
        <Box id="route-map-area"></Box>
        <Paper id="detail-panel" shadow="xs" radius="md"></Paper>
      </Paper>
    </Paper>
  );
}
