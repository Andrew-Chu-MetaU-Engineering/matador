import PropTypes from "prop-types";
import { Card, Text, Rating, Group } from "@mantine/core";
import { IconFlagFilled } from "@tabler/icons-react";
import "./SearchResult.css";

export default function SearchResult({ option, active, setActiveOption }) {
  const { place, route, extracted } = option;
  const durationMinutes = Math.round(extracted.duration / 60); // extracted.duration is in seconds
  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      mb="xs"
      onClick={() =>
        setActiveOption({
          id: place.id,
          route: route?.polyline?.encodedPolyline,
        })
      }
    >
      <Group justify="space-between">
        <Text size="lg">{place.displayName.text}</Text>
        {active && <IconFlagFilled id="result-flag-icon" />}
      </Group>
      <div id="place-properties">
        <Text size="md" c="dimmed" truncate="end">
          {durationMinutes >= 60 && (
            <span>{Math.trunc(durationMinutes / 60)}h </span>
          )}
          {durationMinutes % 60}m &middot; ${extracted.fare.toFixed(2)}
        </Text>
        <div id="price-and-rating-wrapper">
          {extracted.priceLevel > 0 && (
            <Text size="sm" c="dimmed" truncate="end">
              {"$".repeat(extracted.priceLevel)}
            </Text>
          )}
          {place.rating && (
            <Group gap="xs">
              <Rating value={place.rating} fractions={2} size="xs" readOnly />
              <Text size="sm" c="dimmed" truncate="end">
                {place.rating.toFixed(1)}
              </Text>
            </Group>
          )}
        </div>
      </div>
    </Card>
  );
}

SearchResult.propTypes = {
  option: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  setActiveOption: PropTypes.func.isRequired,
};
