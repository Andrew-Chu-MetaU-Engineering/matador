import PropTypes from "prop-types";
import { Button, Paper, ScrollArea, Text } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import StepInfoPane from "./StepInfoPane";
import "./RouteDetail.css";

export default function RouteDetail({ option, setIsRouteDetailDisplayed }) {
  const {
    place,
    route: { legs },
  } = option;

  function fadeIn(i) {
    const DURATION = 800; // values found through visual testing
    const DELAY = 100;
    return `fade-in ${DURATION}ms ease-in ${DELAY * i}ms forwards`;
  }

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
      <Text size="lg" fw={800} ta="center" m="sm">
        Route to {place.displayName.text}
      </Text>
      <ScrollArea scrollbars="y">
        {legs.map((leg) => {
          return leg.steps?.map((step, i) => (
            <article
              className="fade-animation-wrapper"
              key={i}
              style={{ animation: fadeIn(i) }}
            >
              <StepInfoPane step={step} />
            </article>
          ));
        })}
      </ScrollArea>
    </Paper>
  );
}

RouteDetail.propTypes = {
  option: PropTypes.object.isRequired,
  setIsRouteDetailDisplayed: PropTypes.func.isRequired,
};
