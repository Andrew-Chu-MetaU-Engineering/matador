import PropTypes from "prop-types";
import { Card, Text } from "@mantine/core";

export default function SearchResult({ option }) {
  return (
    <Card shadow="xs" padding="md" radius="md" mb="xs">
      <Text size="lg">{option.place.displayName.text}</Text>
      <Text size="md" c="dimmed" truncate="end">
        1h 26m &middot; $6.25
      </Text>
    </Card>
  );
}

SearchResult.propTypes = {
  option: PropTypes.object.isRequired,
};
