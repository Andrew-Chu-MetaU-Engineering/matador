import PropTypes from "prop-types";
import { Accordion } from "@mantine/core";
import { IconWalk, IconTrain } from "@tabler/icons-react";
import StepInfoPane from "./StepInfoPane";
import "./StepsOverview.css";

function StepsOverview({ stepsOverview, steps }) {
  const TRAVEL_MODE_ICONS = {
    TRANSIT: <IconTrain />,
    WALK: <IconWalk />,
  };

  const overviewAccordionItems = stepsOverview.multiModalSegments.map(
    (overview, i) => {
      const {
        navigationInstruction,
        stepStartIndex,
        stepEndIndex,
        travelMode,
      } = overview;

      const overviewTitle =
        navigationInstruction == null
          ? travelMode.charAt(0, 0) + travelMode.slice(1).toLowerCase()
          : navigationInstruction.instructions;

      return (
        <Accordion.Item
          key={i}
          value={overviewTitle}
          className="accordion-item fade-animation"
          style={{ animation: fadeIn(i) }}
          mt="xs"
        >
          <Accordion.Control icon={TRAVEL_MODE_ICONS[travelMode]}>
            {overviewTitle}
          </Accordion.Control>
          <Accordion.Panel>
            {steps.slice(stepStartIndex, stepEndIndex + 1).map((step, j) => (
              <StepInfoPane key={j} step={step} />
            ))}
          </Accordion.Panel>
        </Accordion.Item>
      );
    }
  );

  function fadeIn(i) {
    const DURATION = 1000; // values found through visual testing
    const DELAY = 500;
    return `fade-in ${DURATION}ms ease-in ${DELAY * i}ms forwards`;
  }

  return (
    <Accordion transitionDuration={1000} variant="separated" radius="md">
      {overviewAccordionItems}
    </Accordion>
  );
}

StepsOverview.propTypes = {
  stepsOverview: PropTypes.object.isRequired,
  steps: PropTypes.array.isRequired,
};

export default StepsOverview;
