import PropTypes from "prop-types";
import { Paper, Text } from "@mantine/core";
import "./StepInfoPane.css";

export default function StepInfoPane({ step }) {
  const { navigationInstruction, localizedValues } = step;

  return (
    <Paper className="detail-pane">
      <Text className="instructions" fw={600}>
        {navigationInstruction.instructions}
      </Text>
      <Text size="sm">
        {localizedValues.distance.text} &middot;{" "}
        {localizedValues.staticDuration.text}
      </Text>
    </Paper>
  );
}

StepInfoPane.propTypes = {
  step: PropTypes.object.isRequired,
};
