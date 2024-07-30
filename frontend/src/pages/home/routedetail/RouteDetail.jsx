import PropTypes from "prop-types";
import { Button, Paper, ScrollArea, Text } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import StepsOverview from "./StepsOverview";
import "./RouteDetail.css";

export default function RouteDetail({ option, setIsRouteDetailDisplayed }) {
  const {
    place,
    route: { legs },
  } = option;

  // A RouteLeg object; only one leg because no other intermediate waypoints specified
  const { localizedValues, steps, stepsOverview } = legs[0];

  return (
    <Paper id="detail-panel">
      <section>
        <Button
          onClick={() => setIsRouteDetailDisplayed(false)}
          leftSection={<IconArrowBack />}
          m="lg"
          variant="outline"
          radius="lg"
        >
          Back
        </Button>
      </section>
      <Text size="lg" fw={800} ta="center">
        Route to {place.displayName.text}
      </Text>
      <Text size="sm" ta="center" mb="xs">
        Trip Details: {localizedValues.distance.text} |{" "}
        {localizedValues.duration.text}
      </Text>
      <ScrollArea scrollbars="y">
        <StepsOverview stepsOverview={stepsOverview} steps={steps} />
      </ScrollArea>
    </Paper>
  );
}

RouteDetail.propTypes = {
  option: PropTypes.object.isRequired,
  setIsRouteDetailDisplayed: PropTypes.func.isRequired,
};
