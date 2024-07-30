import PropTypes from "prop-types";
import { Group, Badge } from "@mantine/core";
import { scaleSequential, interpolateRdYlGn } from "d3";

export default function ScoreBadges({ scores }) {
  const colorScheme = scaleSequential(interpolateRdYlGn);
  return (
    <Group justify="center" mt="sm">
      {Object.entries(scores).map(([scoreType, score]) => (
        <Badge
          key={scoreType}
          variant="filled"
          color={colorScheme(score)}
          autoContrast
        >
          {scoreType}
        </Badge>
      ))}
    </Group>
  );
}

ScoreBadges.propTypes = {
  scores: PropTypes.object.isRequired,
};
