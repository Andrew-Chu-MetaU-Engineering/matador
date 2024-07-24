import PropTypes from "prop-types";
import { Card, Text, Rating, Group, Button } from "@mantine/core";
import { IconFlagFilled } from "@tabler/icons-react";
import "./SearchResult.css";

export default function SearchResult({
  option,
  activeOption,
  setActiveOption,
  setIsRouteDetailDisplayed,
}) {
  const { place, extracted } = option;
  const durationMinutes = Math.round(extracted.duration / 60); // extracted.duration is in seconds

  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      mb="xs"
      onClick={() => {
        if (activeOption?.place.id !== option?.place.id) {
          setActiveOption(option);
          setIsRouteDetailDisplayed(false);
        }
      }}
    >
      <Group justify="space-between">
        <Text size="lg">{place.displayName.text}</Text>
        {activeOption?.place.id === option?.place.id && (
          <IconFlagFilled id="result-flag-icon" />
        )}
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
      <Button
        onClick={() => {
          setIsRouteDetailDisplayed(true);
        }}
        variant="light"
        fullWidth
        mt="md"
        radius="md"
      >
        See route details
      </Button>
    </Card>
  );
}

SearchResult.propTypes = {
  option: PropTypes.object.isRequired,
  activeOption: PropTypes.object,
  setActiveOption: PropTypes.func.isRequired,
  setIsRouteDetailDisplayed: PropTypes.func.isRequired,
};