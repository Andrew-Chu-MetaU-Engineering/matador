import PropTypes from "prop-types";
import { Card, Text, Rating, Group, Button, ActionIcon } from "@mantine/core";
import {
  IconHeart,
  IconHeartFilled,
  IconFlagFilled,
} from "@tabler/icons-react";
import "./SearchResult.css";
import ScoreBadges from "./ScoreBadges";

export default function SearchResult({
  option,
  activeOption,
  setActiveOption,
  setIsRouteDetailDisplayed,
  liked,
  handleLikePlace,
}) {
  const {
    place: { id, displayName, rating },
    extracted,
    scores,
  } = option;
  const durationMinutes = Math.round(extracted.duration / 60); // extracted.duration is in seconds

  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      mb="xs"
      onClick={() => {
        if (activeOption?.place.id !== id) {
          setActiveOption(option);
          setIsRouteDetailDisplayed(false);
        }
      }}
    >
      <Group justify="space-between">
        <Text size="lg">{displayName.text}</Text>
        <Group>
          {activeOption?.place.id === option?.place.id && (
            <IconFlagFilled id="result-flag-icon" />
          )}
          <ActionIcon
            onClick={() =>
              liked ? handleLikePlace(id, true) : handleLikePlace(id, false)
            }
            color="red"
            variant="light"
          >
            {liked ? <IconHeartFilled /> : <IconHeart />}
          </ActionIcon>
        </Group>
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
          {rating && (
            <Group gap="xs">
              <Rating value={rating} fractions={2} size="xs" readOnly />
              <Text size="sm" c="dimmed" truncate="end">
                {rating.toFixed(1)}
              </Text>
            </Group>
          )}
        </div>
      </div>
      <ScoreBadges scores={scores} />
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
  liked: PropTypes.bool.isRequired,
  handleLikePlace: PropTypes.func.isRequired,
};
